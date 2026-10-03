"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square, Volume2, VolumeX } from "lucide-react";
import VoiceAvatar, { type AvatarState } from "./VoiceAvatar";
import { getAudioContext, readLevel, Recorder, SentenceSplitter, SpeechQueue } from "@/lib/voice-client";

type Phase = "start" | "idle" | "listening" | "transcribing" | "thinking" | "speaking";

const STATUS: Record<Phase, string> = {
  start: "Suhbatni boshlash uchun tugmani bosing",
  idle: "Mikrofon tugmasini bosing va gapiring",
  listening: "Tinglayapman… gapirib bo‘lgach biroz jim turing",
  transcribing: "Eshitganimni tushunyapman…",
  thinking: "O‘ylayapman…",
  speaking: "Gapiryapman — to‘xtatish uchun tugmani bosing",
};

export default function VoiceMentor({
  name,
  onExchange,
}: {
  name: string;
  /** Savol-javob tugaganda — matnli tarixga qo'shish uchun */
  onExchange?: (question: string, answer: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>("start");
  const [youSaid, setYouSaid] = useState("");
  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");
  const [muted, setMuted] = useState(false);

  const recorder = useRef<Recorder | null>(null);
  const queue = useRef<SpeechQueue | null>(null);
  const abort = useRef<AbortController | null>(null);
  const turn = useRef(0);
  const levelBuf = useRef(new Uint8Array(new ArrayBuffer(1024)));
  const phaseRef = useRef<Phase>("start");
  phaseRef.current = phase;
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const getQueue = () => {
    if (!queue.current) {
      const q = new SpeechQueue();
      q.onStateChange = (speaking) => {
        if (speaking) setPhase("speaking");
      };
      q.onError = (msg) => setNote(msg);
      queue.current = q;
    }
    return queue.current;
  };

  const getLevel = useCallback(() => {
    if (phaseRef.current === "listening") return readLevel(recorder.current?.analyser ?? null, levelBuf.current);
    if (phaseRef.current === "speaking") return readLevel(queue.current?.analyser ?? null, levelBuf.current);
    return 0;
  }, []);

  const stopAll = () => {
    turn.current++;
    abort.current?.abort();
    abort.current = null;
    queue.current?.stop();
    recorder.current?.cancel();
    recorder.current = null;
  };

  useEffect(() => stopAll, []);

  /** Matnli javobni olish va bo'laklab ovozga aylantirish */
  const ask = async (question: string, myTurn: number) => {
    setPhase("thinking");
    setReply("");
    const controller = new AbortController();
    abort.current = controller;
    const q = getQueue();
    const splitter = new SentenceSplitter((chunk) => {
      if (!mutedRef.current) q.enqueue(chunk);
    });
    let full = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, voice: true }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Javob olib bo‘lmadi.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const piece = decoder.decode(value, { stream: true });
        full += piece;
        splitter.push(piece);
        setReply(full);
      }
      splitter.flush();
      onExchange?.(question, full.trim());
      await q.whenIdle();
      if (myTurn === turn.current) setPhase("idle");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      if (myTurn === turn.current) {
        setNote(err instanceof Error ? err.message : "Xatolik yuz berdi.");
        setPhase("idle");
      }
    }
  };

  const finishListening = async () => {
    const rec = recorder.current;
    if (!rec || phaseRef.current !== "listening") return;
    recorder.current = null;
    const myTurn = turn.current;
    setPhase("transcribing");
    try {
      const wav = await rec.stop();
      if (!wav) {
        setNote("Hech narsa eshitilmadi. Qayta urinib ko‘ring.");
        setPhase("idle");
        return;
      }
      const res = await fetch("/api/voice/stt", { method: "POST", headers: { "Content-Type": "audio/wav" }, body: wav });
      const data = await res.json().catch(() => ({}));
      if (myTurn !== turn.current) return;
      if (!res.ok) throw new Error(data.error || "Ovozni tanib bo‘lmadi.");
      const text = String(data.text || "").trim();
      if (!text) {
        setNote("Tushuna olmadim — biroz balandroq va aniqroq qayta ayting.");
        setPhase("idle");
        return;
      }
      setYouSaid(text);
      await ask(text, myTurn);
    } catch (err) {
      if (myTurn === turn.current) {
        setNote(err instanceof Error ? err.message : "Xatolik yuz berdi.");
        setPhase("idle");
      }
    }
  };

  const startListening = async () => {
    stopAll();
    setNote("");
    getAudioContext();
    const rec = new Recorder();
    try {
      await rec.start(() => void finishListening());
      recorder.current = rec;
      setPhase("listening");
    } catch {
      setNote("Mikrofonga ruxsat berilmadi. Brauzer sozlamalaridan mikrofonni yoqing.");
      setPhase("idle");
    }
  };

  const greet = () => {
    getAudioContext();
    const text = `Salom, ${name}! Men Aziza, sizning AI mentoringizman. IT, darslar yoki universitetlar haqida nima so‘ramoqchisiz? Mikrofon tugmasini bosing va gapiring.`;
    setReply(text);
    setPhase("idle");
    if (!mutedRef.current) getQueue().enqueue(text);
    void getQueue()
      .whenIdle()
      .then(() => phaseRef.current === "speaking" && setPhase("idle"));
  };

  const onMic = () => {
    if (phase === "start") return greet();
    if (phase === "listening") return void finishListening();
    void startListening();
  };

  const avatarState: AvatarState =
    phase === "listening" ? "listening" : phase === "thinking" || phase === "transcribing" ? "thinking" : phase === "speaking" ? "speaking" : "idle";

  return (
    <>
      <div className="voice-stage">
        <VoiceAvatar state={avatarState} getLevel={getLevel} size={210} />
        <div>
          <div className="voice-name">Aziza</div>
          <div className="voice-status" aria-live="polite">
            {STATUS[phase]}
          </div>
        </div>
        {youSaid && (
          <p className="voice-you">
            <b>Siz:</b> {youSaid}
          </p>
        )}
        {reply && <p className="voice-reply">{reply}</p>}
        {note && (
          <div className="alert" role="status" style={{ maxWidth: 520 }}>
            {note}
          </div>
        )}
      </div>

      <div className="voice-controls">
        <button
          className="round-btn"
          aria-pressed={muted}
          onClick={() => {
            setMuted((m) => !m);
            if (!muted) queue.current?.stop();
          }}
          aria-label={muted ? "Ovozni yoqish" : "Ovozsiz (faqat matn)"}
          title={muted ? "Ovozni yoqish" : "Ovozsiz (faqat matn)"}
        >
          {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
        </button>
        <button
          className={`mic-btn${phase === "listening" ? " rec" : ""}`}
          onClick={onMic}
          disabled={phase === "transcribing"}
          aria-label={phase === "listening" ? "Gapirishni tugatish" : phase === "start" ? "Suhbatni boshlash" : "Gapirish"}
        >
          {phase === "listening" ? <Square size={24} fill="currentColor" /> : <Mic size={28} />}
        </button>
        <span style={{ width: 46 }} aria-hidden="true" />
      </div>
    </>
  );
}
