/**
 * Brauzer tomonidagi ovoz vositalari (faqat client komponentlarda ishlatiladi).
 * - Recorder: mikrofon → 16 kHz mono WAV, jimlikda avtomatik to'xtaydi
 * - SpeechQueue: matn bo'laklarini ketma-ket ovozga aylantirib ijro etadi
 * - SentenceSplitter: oqimli matndan tayyor jumlalarni ajratadi
 * Ikkalasi ham analyser beradi — avatar shu orqali "gapiradi".
 */

let sharedCtx: AudioContext | null = null;

/** Foydalanuvchi bosganda chaqirilishi kerak (iOS/Safari talabi). */
export function getAudioContext(): AudioContext {
  if (!sharedCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedCtx = new Ctx();
  }
  if (sharedCtx.state === "suspended") sharedCtx.resume().catch(() => {});
  return sharedCtx;
}

/** Analyserdan 0..1 oralig'idagi ovoz balandligi */
export function readLevel(analyser: AnalyserNode | null, buf: Uint8Array<ArrayBuffer>): number {
  if (!analyser) return 0;
  analyser.getByteTimeDomainData(buf);
  let sum = 0;
  for (let i = 0; i < buf.length; i++) {
    const v = (buf[i] - 128) / 128;
    sum += v * v;
  }
  return Math.min(1, Math.sqrt(sum / buf.length) * 4);
}

/* ============================== Yozib olish ============================== */

export class Recorder {
  analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private media: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private source: MediaStreamAudioSourceNode | null = null;
  private raf = 0;
  private startedAt = 0;

  /** onSilence — gapirib bo'lingach ~1.4 s jimlik bo'lsa chaqiriladi */
  async start(onSilence: () => void, maxMs = 30_000) {
    const ctx = getAudioContext();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    this.source = ctx.createMediaStreamSource(this.stream);
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.source.connect(this.analyser);

    this.chunks = [];
    this.media = new MediaRecorder(this.stream);
    this.media.ondataavailable = (e) => e.data.size && this.chunks.push(e.data);
    this.media.start(250);
    this.startedAt = performance.now();

    // Oddiy jimlik detektori
    const buf = new Uint8Array(new ArrayBuffer(this.analyser.fftSize));
    let spoke = false;
    let quietSince = 0;
    const tick = () => {
      if (!this.media || this.media.state !== "recording") return;
      const level = readLevel(this.analyser, buf);
      const now = performance.now();
      if (level > 0.12) {
        spoke = true;
        quietSince = 0;
      } else if (spoke) {
        quietSince ||= now;
        if (now - quietSince > 1400) return onSilence();
      }
      if (now - this.startedAt > maxMs) return onSilence();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  /** To'xtatib, 16 kHz WAV qaytaradi */
  async stop(): Promise<Blob | null> {
    cancelAnimationFrame(this.raf);
    const media = this.media;
    if (!media) return null;
    const done = new Promise<void>((r) => (media.onstop = () => r()));
    if (media.state !== "inactive") media.stop();
    await done;
    this.cleanup();
    if (!this.chunks.length) return null;
    const blob = new Blob(this.chunks, { type: media.mimeType || "audio/webm" });
    return toWav16k(blob);
  }

  cancel() {
    cancelAnimationFrame(this.raf);
    if (this.media && this.media.state !== "inactive") this.media.stop();
    this.cleanup();
  }

  private cleanup() {
    this.source?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.source = null;
    this.analyser = null;
    this.media = null;
  }
}

async function toWav16k(blob: Blob): Promise<Blob | null> {
  const ctx = getAudioContext();
  const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
  if (decoded.duration < 0.3) return null;
  const rate = 16000;
  const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * rate), rate);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start();
  const rendered = await offline.startRendering();
  const pcm = rendered.getChannelData(0);

  const out = new DataView(new ArrayBuffer(44 + pcm.length * 2));
  const write = (o: number, s: string) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
  write(0, "RIFF");
  out.setUint32(4, 36 + pcm.length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  out.setUint32(16, 16, true);
  out.setUint16(20, 1, true);
  out.setUint16(22, 1, true);
  out.setUint32(24, rate, true);
  out.setUint32(28, rate * 2, true);
  out.setUint16(32, 2, true);
  out.setUint16(34, 16, true);
  write(36, "data");
  out.setUint32(40, pcm.length * 2, true);
  for (let i = 0; i < pcm.length; i++) {
    const s = Math.max(-1, Math.min(1, pcm[i]));
    out.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([out.buffer], { type: "audio/wav" });
}

/* ============================== Ijro navbati ============================== */

type Item = { text: string; audio: Promise<AudioBuffer | null> };

export class SpeechQueue {
  analyser: AnalyserNode | null = null;
  onStateChange?: (speaking: boolean) => void;
  /** Ovoz yaratilmasa (limit, tarmoq) — UI matnni ko'rsatib turadi */
  onError?: (message: string) => void;
  /** Har bir bo'lak ijro boshlanganda */
  onItemStart?: (index: number, text: string) => void;

  private items: Item[] = [];
  private playing = false;
  private current: AudioBufferSourceNode | null = null;
  private generation = 0;
  private index = 0;

  constructor(private ttsUrl = "/api/voice/tts") {}

  get speaking() {
    return this.playing;
  }

  /** Matnni navbatga qo'shadi; audio darhol fondida yuklana boshlaydi */
  enqueue(text: string) {
    const clean = text.trim();
    if (!clean) return;
    const gen = this.generation;
    const audio = this.load(clean, gen);
    this.items.push({ text: clean, audio });
    if (!this.playing) void this.playNext(gen);
  }

  /** Navbatdagilar tugaganda resolve bo'ladi */
  whenIdle(): Promise<void> {
    if (!this.playing && this.items.length === 0) return Promise.resolve();
    return new Promise((r) => {
      const check = () => (!this.playing && this.items.length === 0 ? r() : setTimeout(check, 120));
      check();
    });
  }

  stop() {
    this.generation++;
    this.items = [];
    try {
      this.current?.stop();
    } catch {
      /* allaqachon to'xtagan */
    }
    this.current = null;
    this.setPlaying(false);
  }

  private async load(text: string, gen: number): Promise<AudioBuffer | null> {
    try {
      const res = await fetch(this.ttsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (gen === this.generation) this.onError?.(data.error || "Ovoz yaratilmadi.");
        return null;
      }
      return await getAudioContext().decodeAudioData(await res.arrayBuffer());
    } catch {
      if (gen === this.generation) this.onError?.("Ovoz yuklanmadi. Internetni tekshiring.");
      return null;
    }
  }

  private setPlaying(v: boolean) {
    if (this.playing !== v) {
      this.playing = v;
      this.onStateChange?.(v);
    }
  }

  private async playNext(gen: number): Promise<void> {
    const item = this.items.shift();
    if (!item || gen !== this.generation) {
      if (gen === this.generation) this.setPlaying(false);
      return;
    }
    this.setPlaying(true);
    const buffer = await item.audio;
    if (gen !== this.generation) return;
    this.onItemStart?.(this.index++, item.text);

    if (!buffer) {
      // Ovoz bo'lmasa — matnni o'qishga vaqt berib, keyingisiga o'tamiz
      await new Promise((r) => setTimeout(r, Math.min(6000, 600 + item.text.length * 45)));
      return this.playNext(gen);
    }

    const ctx = getAudioContext();
    if (!this.analyser) {
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.connect(ctx.destination);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.analyser);
    this.current = src;
    await new Promise<void>((resolve) => {
      src.onended = () => resolve();
      src.start();
    });
    if (gen === this.generation) void this.playNext(gen);
  }
}

/* ============================== Jumlalarga bo'lish ============================== */

/** Oqim bo'lib kelayotgan matndan TTS uchun qulay bo'laklar ajratadi. */
export class SentenceSplitter {
  private buffer = "";
  constructor(private onChunk: (text: string) => void, private minLen = 70) {}

  push(piece: string) {
    this.buffer += piece;
    for (;;) {
      const m = /[.!?…](\s|$)/.exec(this.buffer);
      if (!m) break;
      const end = m.index + 1;
      // Juda qisqa bo'laklarni yig'ib yuboramiz (TTS so'rovlari kamroq bo'lsin)
      if (end < this.minLen) {
        const next = /[.!?…](\s|$)/.exec(this.buffer.slice(end));
        if (!next) break;
        this.emit(end + next.index + 1);
      } else {
        this.emit(end);
      }
    }
  }

  flush() {
    if (this.buffer.trim()) this.onChunk(this.buffer.trim());
    this.buffer = "";
  }

  private emit(end: number) {
    const chunk = this.buffer.slice(0, end).trim();
    this.buffer = this.buffer.slice(end);
    if (chunk) this.onChunk(chunk);
  }
}

/** Uzun matnni jumla chegarasida ~max belgilik bo'laklarga bo'lish (birinchi ovoz tezroq keladi) */
export function splitForSpeech(text: string, max = 300): string[] {
  const sentences = text.match(/[^.!?…]+[.!?…]*\s*/g) ?? [text];
  const out: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if (cur && (cur + s).length > max) {
      out.push(cur.trim());
      cur = "";
    }
    cur += s;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
