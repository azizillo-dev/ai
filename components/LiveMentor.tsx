"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, Play } from "lucide-react";
import Character, { type CharacterState } from "./Character";
import VoiceMentor from "./VoiceMentor";
import { CHARACTERS, isCharacterId, type CharacterId } from "@/lib/characters";
import { LiveSession, type LiveState } from "@/lib/live-client";
import { getAudioContext, readLevel } from "@/lib/voice-client";

const STATUS: Record<LiveState | "idle", string> = {
  idle: "Boshlash tugmasini bosing — keyin shunchaki gapiravering",
  connecting: "Ulanmoqda…",
  listening: "Tinglayapman — bemalol gapiring",
  speaking: "Gapiryapman — so‘zimni bo‘lib gapirishingiz mumkin",
  closed: "Suhbat yakunlandi",
};

/**
 * Real vaqtdagi ovozli suhbat: tugma faqat boshlash/tugatish uchun.
 * Agar real vaqt rejimi ishlamasa — navbatma-navbat (eski) rejimga o'tish taklif qilinadi.
 */
export default function LiveMentor({
  name,
  onExchange,
}: {
  name: string;
  onExchange?: (question: string, answer: string) => void;
}) {
  const [character, setCharacter] = useState<CharacterId>("madina");
  const [state, setState] = useState<LiveState | "idle">("idle");
  const [userText, setUserText] = useState("");
  const [modelText, setModelText] = useState("");
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);
  const [fallback, setFallback] = useState(false);
  const session = useRef<LiveSession | null>(null);
  const buf = useRef(new Uint8Array(new ArrayBuffer(1024)));
  const stateRef = useRef(state);
  stateRef.current = state;

  // Tanlangan qahramon shu brauzerda eslab qolinadi
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hp-character");
      if (isCharacterId(saved)) setCharacter(saved);
    } catch {
      /* localStorage yo'q */
    }
  }, []);
  const choose = (id: CharacterId) => {
    setCharacter(id);
    try {
      localStorage.setItem("hp-character", id);
    } catch {
      /* e'tiborsiz */
    }
  };

  useEffect(() => () => session.current?.stop(), []);

  const getLevel = useCallback(() => {
    const s = session.current;
    if (!s) return 0;
    if (stateRef.current === "speaking") return readLevel(s.outAnalyser, buf.current);
    return Math.min(1, s.micLevel * 5);
  }, []);

  const start = async () => {
    setError("");
    setUserText("");
    setModelText("");
    getAudioContext();
    const s = new LiveSession(character, {
      onState: setState,
      onUserText: (t) => {
        setUserText(t);
        setModelText("");
      },
      onModelText: setModelText,
      onTurn: (q, a) => {
        onExchange?.(q, a);
        void fetch("/api/chat/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, answer: a }),
        }).catch(() => {});
      },
      onError: setError,
    });
    s.muted = muted;
    session.current = s;
    try {
      await s.start();
    } catch (err) {
      s.stop();
      session.current = null;
      setState("idle");
      setError(err instanceof Error ? err.message : "Ovozli suhbatni boshlab bo‘lmadi.");
    }
  };

  const stop = () => {
    session.current?.stop();
    session.current = null;
    setState("idle");
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (session.current) session.current.muted = next;
  };

  if (fallback) {
    return (
      <>
        <div style={{ textAlign: "center", padding: "10px var(--gutter) 0" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setFallback(false)}>
            Real vaqt rejimiga qaytish
          </button>
        </div>
        <VoiceMentor name={name} onExchange={onExchange} />
      </>
    );
  }

  const active = state === "connecting" || state === "listening" || state === "speaking";
  const charState: CharacterState =
    state === "speaking" ? "speaking" : state === "connecting" ? "thinking" : state === "listening" ? "listening" : "idle";
  const persona = CHARACTERS[character];

  return (
    <>
      <div className="voice-stage live-stage">
        {!active && (
          <div className="seg" role="group" aria-label="Mentorni tanlang">
            {(Object.keys(CHARACTERS) as CharacterId[]).map((id) => (
              <button key={id} aria-pressed={character === id} onClick={() => choose(id)}>
                {CHARACTERS[id].name} ({CHARACTERS[id].gender})
              </button>
            ))}
          </div>
        )}
        <div className="character-stage">
          <Character id={character} state={charState} getLevel={getLevel} />
        </div>
        <div>
          <div className="voice-name">{persona.name}</div>
          <div className="voice-status" aria-live="polite">
            {muted && active ? "Mikrofon o‘chirilgan" : STATUS[state]}
          </div>
        </div>
        {userText && (
          <p className="voice-you">
            <b>Siz:</b> {userText}
          </p>
        )}
        {modelText && <p className="voice-reply">{modelText}</p>}
        {error && (
          <div className="alert" role="status" style={{ maxWidth: 520, display: "grid", gap: 8 }}>
            <span>{error}</span>
            {!active && (
              <button className="btn btn-outline btn-sm" style={{ justifySelf: "start" }} onClick={() => setFallback(true)}>
                Navbatma-navbat rejimda gaplashish
              </button>
            )}
          </div>
        )}
      </div>

      <div className="voice-controls">
        {active ? (
          <>
            <button className="round-btn" aria-pressed={muted} onClick={toggleMute} aria-label={muted ? "Mikrofonni yoqish" : "Mikrofonni o‘chirish"}>
              {muted ? <MicOff size={19} /> : <Mic size={19} />}
            </button>
            <button className="mic-btn end" onClick={stop} aria-label="Suhbatni tugatish">
              <PhoneOff size={26} />
            </button>
            <span style={{ width: 46 }} aria-hidden="true" />
          </>
        ) : (
          <button className="btn btn-primary btn-lg" onClick={start}>
            <Play size={18} fill="currentColor" /> {persona.name} bilan gaplashish
          </button>
        )}
      </div>
    </>
  );
}
