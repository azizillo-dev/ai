"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Headphones, X } from "lucide-react";
import VoiceAvatar from "./VoiceAvatar";
import { getAudioContext, readLevel, SpeechQueue, splitForSpeech } from "@/lib/voice-client";

/** Berilgan matn bo'laklarini Madina ovozida o'qib beruvchi suzuvchi panel. */
export default function Narrator({ parts, label = "Natijamni tinglash" }: { parts: string[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [caption, setCaption] = useState("");
  const [note, setNote] = useState("");
  const queue = useRef<SpeechQueue | null>(null);
  const buf = useRef(new Uint8Array(new ArrayBuffer(1024)));

  const getLevel = useCallback(() => readLevel(queue.current?.analyser ?? null, buf.current), []);

  const close = () => {
    queue.current?.stop();
    setOpen(false);
    setSpeaking(false);
  };

  useEffect(() => () => queue.current?.stop(), []);

  const play = () => {
    getAudioContext();
    queue.current?.stop();
    const q = new SpeechQueue();
    q.onStateChange = setSpeaking;
    q.onItemStart = (_i, text) => setCaption(text);
    q.onError = setNote;
    queue.current = q;
    setNote("");
    const chunks = parts.flatMap((p) => splitForSpeech(p));
    setCaption(chunks[0] ?? "");
    setOpen(true);
    chunks.forEach((c) => q.enqueue(c));
  };

  return (
    <>
      <button className="btn btn-outline" onClick={play}>
        <Headphones size={17} /> {label}
      </button>
      {open && (
        <div className="narrator" role="dialog" aria-label="Madina tushuntirmoqda">
          <div className="narrator-head">
            <VoiceAvatar state={speaking ? "speaking" : "idle"} getLevel={getLevel} size={64} />
            <div style={{ flex: 1 }}>
              <strong>Madina</strong>
              <div className="muted" style={{ fontSize: 13 }}>
                {speaking ? "Gapiryapti…" : note ? "Ovoz yuklanmadi" : "Tayyorlanmoqda…"}
              </div>
            </div>
            <button className="round-btn" style={{ width: 38, height: 38 }} onClick={close} aria-label="Yopish">
              <X size={18} />
            </button>
          </div>
          <p aria-live="polite">{caption}</p>
          {note && <div className="alert" style={{ fontSize: 13 }}>{note}</div>}
        </div>
      )}
    </>
  );
}
