/**
 * Real vaqtdagi ovozli suhbat (Gemini Live) — faqat brauzerda ishlaydi.
 * Tugma bosish shart emas: mikrofon doim tinglaydi, gap tugaganini server o'zi aniqlaydi,
 * javob ovozi kelishi bilan ijro etiladi. Foydalanuvchi gapirib qolsa — mentor to'xtaydi.
 */

import { getAudioContext } from "./voice-client";
import type { CharacterId } from "./characters";

export type LiveState = "connecting" | "listening" | "speaking" | "closed";

const WS_BASE =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained";

// Mikrofon ovozini 16 kHz PCM16 ga aylantiruvchi AudioWorklet (~100 ms bo'laklar)
const WORKLET = `
class Pcm16k extends AudioWorkletProcessor {
  constructor() { super(); this.ratio = sampleRate / 16000; this.pos = 0; this.sum = 0; this.n = 0; this.out = []; }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) {
      for (let i = 0; i < ch.length; i++) {
        this.sum += ch[i]; this.n++; this.pos += 1;
        if (this.pos >= this.ratio) { this.pos -= this.ratio; this.out.push(this.sum / this.n); this.sum = 0; this.n = 0; }
      }
      if (this.out.length >= 1600) {
        const pcm = new Int16Array(this.out.length);
        let energy = 0;
        for (let i = 0; i < this.out.length; i++) {
          const s = Math.max(-1, Math.min(1, this.out[i]));
          energy += s * s;
          pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        this.port.postMessage({ pcm: pcm.buffer, rms: Math.sqrt(energy / this.out.length) }, [pcm.buffer]);
        this.out = [];
      }
    }
    return true;
  }
}
registerProcessor("pcm16k", Pcm16k);
`;

const workletLoaded = new WeakSet<BaseAudioContext>();

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

function fromBase64(b64: string): Int16Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Int16Array(bytes.buffer, 0, bytes.length >> 1);
}

export interface LiveHandlers {
  onState?: (s: LiveState) => void;
  onUserText?: (text: string) => void;
  onModelText?: (text: string) => void;
  onTurn?: (question: string, answer: string) => void;
  onError?: (message: string) => void;
}

export class LiveSession {
  micAnalyser: AnalyserNode | null = null;
  outAnalyser: AnalyserNode | null = null;
  muted = false;

  private ws: WebSocket | null = null;
  private stream: MediaStream | null = null;
  private nodes: AudioNode[] = [];
  private sources = new Set<AudioBufferSourceNode>();
  private playHead = 0;
  private userText = "";
  private modelText = "";
  private state: LiveState = "closed";
  private stopping = false;
  private lastRms = 0;

  constructor(private character: CharacterId, private h: LiveHandlers) {}

  get micLevel() {
    return this.lastRms;
  }

  private setState(s: LiveState) {
    if (this.state !== s) {
      this.state = s;
      this.h.onState?.(s);
    }
  }

  async start() {
    this.stopping = false;
    this.setState("connecting");
    const ctx = getAudioContext();

    // 1) Mikrofon ruxsati (avval — foydalanuvchi bosgan paytda)
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch {
      throw new Error("Mikrofonga ruxsat berilmadi. Brauzer sozlamalaridan mikrofonni yoqing.");
    }

    // 2) Token va ulanish (model band bo'lsa — keyingisi)
    for (let attempt = 0; ; attempt++) {
      const res = await fetch("/api/voice/live-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character: this.character, attempt }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Ovozli suhbatni boshlab bo‘lmadi.");
      try {
        await this.connect(data.token, data.model);
        break;
      } catch (err) {
        if (!data.hasMore || this.stopping) throw err;
      }
    }

    // 3) Mikrofon → 16 kHz → serverga
    if (!workletLoaded.has(ctx)) {
      const blobUrl = URL.createObjectURL(new Blob([WORKLET], { type: "application/javascript" }));
      await ctx.audioWorklet.addModule(blobUrl);
      URL.revokeObjectURL(blobUrl);
      workletLoaded.add(ctx);
    }
    const src = ctx.createMediaStreamSource(this.stream);
    const worklet = new AudioWorkletNode(ctx, "pcm16k");
    this.micAnalyser = ctx.createAnalyser();
    this.micAnalyser.fftSize = 1024;
    src.connect(this.micAnalyser);
    src.connect(worklet);
    // Worklet ishlashi uchun grafga ulanishi kerak — ovozsiz chiqish
    const sink = ctx.createGain();
    sink.gain.value = 0;
    worklet.connect(sink).connect(ctx.destination);
    this.nodes.push(src, worklet, sink);

    worklet.port.onmessage = (e: MessageEvent<{ pcm: ArrayBuffer; rms: number }>) => {
      if (this.ws?.readyState !== WebSocket.OPEN) return;
      let { pcm } = e.data;
      this.lastRms = e.data.rms;
      // Exo himoyasi: mentor gapirayotganda past ovozni (karnaydan qaytgan sadoni) yubormaymiz
      const speaking = this.sources.size > 0;
      if (this.muted || (speaking && e.data.rms < 0.06)) pcm = new ArrayBuffer(pcm.byteLength);
      this.ws.send(JSON.stringify({ realtimeInput: { audio: { data: toBase64(pcm), mimeType: "audio/pcm;rate=16000" } } }));
    };

    // 4) Mentor birinchi bo'lib salom bersin
    this.ws?.send(
      JSON.stringify({
        clientContent: {
          turns: [{ role: "user", parts: [{ text: "(Suhbat boshlandi. Menga ismim bilan qisqa salom bering va bugun nima haqida gaplashmoqchi ekanimni so‘rang.)" }] }],
          turnComplete: true,
        },
      })
    );
    this.setState("listening");
  }

  private connect(token: string, model: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${WS_BASE}?access_token=${encodeURIComponent(token)}`);
      let ready = false;
      const timer = setTimeout(() => {
        if (!ready) {
          ws.close();
          reject(new Error("Ulanish juda uzoq davom etdi."));
        }
      }, 12_000);

      ws.onopen = () => ws.send(JSON.stringify({ setup: { model } }));
      ws.onmessage = async (ev) => {
        const raw = typeof ev.data === "string" ? ev.data : await (ev.data as Blob).text();
        let msg: Record<string, unknown>;
        try {
          msg = JSON.parse(raw);
        } catch {
          return;
        }
        if (msg.setupComplete && !ready) {
          ready = true;
          clearTimeout(timer);
          this.ws = ws;
          resolve();
          return;
        }
        this.handle(msg);
      };
      ws.onclose = (ev) => {
        clearTimeout(timer);
        if (!ready) return reject(new Error(ev.reason || "Ulanib bo‘lmadi."));
        if (!this.stopping) {
          this.h.onError?.(
            ev.code === 1000 ? "Suhbat yakunlandi." : "Aloqa uzildi. Davom etish uchun suhbatni qayta boshlang."
          );
        }
        this.cleanup();
      };
      ws.onerror = () => {
        /* onclose da ishlanadi */
      };
    });
  }

  private handle(msg: Record<string, unknown>) {
    const sc = msg.serverContent as
      | {
          modelTurn?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] };
          inputTranscription?: { text?: string };
          outputTranscription?: { text?: string };
          interrupted?: boolean;
          turnComplete?: boolean;
        }
      | undefined;
    if (msg.goAway) this.h.onError?.("Sessiya vaqti tugayapti — yangi suhbat boshlang.");
    if (!sc) return;

    if (sc.inputTranscription?.text) {
      this.userText += sc.inputTranscription.text;
      this.h.onUserText?.(this.userText.trim());
    }
    if (sc.outputTranscription?.text) {
      this.modelText += sc.outputTranscription.text;
      this.h.onModelText?.(this.modelText.trim());
    }
    for (const part of sc.modelTurn?.parts ?? []) {
      if (part.inlineData?.data) this.play(part.inlineData.data, part.inlineData.mimeType ?? "");
    }
    if (sc.interrupted) this.stopPlayback();
    if (sc.turnComplete) {
      const q = this.userText.trim();
      const a = this.modelText.trim();
      if (q && a) this.h.onTurn?.(q, a);
      this.userText = "";
      this.modelText = "";
    }
  }

  private play(b64: string, mime: string) {
    const ctx = getAudioContext();
    const rate = Number(/rate=(\d+)/.exec(mime)?.[1] ?? 24000);
    const pcm = fromBase64(b64);
    if (!pcm.length) return;
    const buffer = ctx.createBuffer(1, pcm.length, rate);
    const ch = buffer.getChannelData(0);
    for (let i = 0; i < pcm.length; i++) ch[i] = pcm[i] / 0x8000;

    if (!this.outAnalyser) {
      this.outAnalyser = ctx.createAnalyser();
      this.outAnalyser.fftSize = 1024;
      this.outAnalyser.connect(ctx.destination);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.outAnalyser);
    this.playHead = Math.max(this.playHead, ctx.currentTime + 0.04);
    src.start(this.playHead);
    this.playHead += buffer.duration;
    this.sources.add(src);
    this.setState("speaking");
    src.onended = () => {
      this.sources.delete(src);
      if (this.sources.size === 0 && this.state === "speaking") this.setState("listening");
    };
  }

  private stopPlayback() {
    for (const s of this.sources) {
      try {
        s.stop();
      } catch {
        /* allaqachon to'xtagan */
      }
    }
    this.sources.clear();
    this.playHead = 0;
    if (this.state === "speaking") this.setState("listening");
  }

  stop() {
    this.stopping = true;
    this.ws?.close(1000);
    this.cleanup();
  }

  private cleanup() {
    this.stopPlayback();
    this.nodes.forEach((n) => n.disconnect());
    this.nodes = [];
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.ws = null;
    this.micAnalyser = null;
    this.setState("closed");
  }
}
