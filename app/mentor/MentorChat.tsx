"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Keyboard, Mic, Square, Trash2 } from "lucide-react";
import Markdown from "@/components/Markdown";
import VoiceMentor from "@/components/VoiceMentor";

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

const SUGGESTIONS = [
  "Bugun 1 soat vaqtim bor. Nimani o‘rganay?",
  "Frontend va backend farqi nima? Oddiy misol bilan",
  "Machine Learning nima?",
  "Yo‘l xaritamdagi birinchi bosqichni qanday boshlay?",
  "Portfolio uchun qanday loyiha qilsam bo‘ladi?",
];

export default function MentorChat({
  name,
  initial,
  prefill,
  startVoice = false,
}: {
  name: string;
  initial: Msg[];
  prefill: string;
  startVoice?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"text" | "voice">(startVoice && !prefill ? "voice" : "text");
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState(prefill);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stickRef = useRef(true);

  // Foydalanuvchi yuqoriga aylantirmagan bo'lsa — pastga yopishib turish
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Textarea balandligini matnga moslash
  useEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || busy) return;
    setInput("");
    setBusy(true);
    stickRef.current = true;

    const uid = `u${Date.now()}`;
    const aid = `a${Date.now()}`;
    setMessages((m) => [...m, { id: uid, role: "user", content: message }, { id: aid, role: "assistant", content: "" }]);

    const update = (fn: (prev: Msg) => Msg) => setMessages((m) => m.map((x) => (x.id === aid ? fn(x) : x)));

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      });
      if (res.status === 401) {
        router.push("/login?next=/mentor");
        return;
      }
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Javob olib bo‘lmadi.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const snapshot = acc;
        update((p) => ({ ...p, content: snapshot }));
      }
      if (!acc.trim()) throw new Error("AI bo‘sh javob qaytardi. Qayta urinib ko‘ring.");
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        update((p) => (p.content ? p : { ...p, content: "_To‘xtatildi._" }));
      } else {
        update((p) => ({ ...p, content: err instanceof Error ? err.message : "Xatolik yuz berdi.", error: true }));
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const clear = async () => {
    if (busy || messages.length === 0) return;
    if (!window.confirm("Suhbat tarixini o‘chirasizmi?")) return;
    await fetch("/api/chat", { method: "DELETE" });
    setMessages([]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-head">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/aziza-avatar.jpg" alt="" width={40} height={40} style={{ borderRadius: "50%" }} />
          <div>
            <h1>Aziza — AI mentor</h1>
            <small>Profilingiz va test natijangizni biladi</small>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div className="seg" role="group" aria-label="Suhbat turi">
            <button aria-pressed={mode === "text"} onClick={() => setMode("text")}>
              <Keyboard size={15} /> <span className="hide-m">Yozish</span>
            </button>
            <button aria-pressed={mode === "voice"} onClick={() => setMode("voice")}>
              <Mic size={15} /> <span className="hide-m">Gaplashish</span>
            </button>
          </div>
          {mode === "text" && messages.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clear} disabled={busy} aria-label="Suhbatni tozalash">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {mode === "voice" ? (
        <VoiceMentor
          name={name}
          onExchange={(q, a) =>
            setMessages((m) => [
              ...m,
              { id: `vu${Date.now()}`, role: "user", content: q },
              { id: `va${Date.now()}`, role: "assistant", content: a },
            ])
          }
        />
      ) : (
        <>

      <div className="chat-scroll" ref={scrollRef} onScroll={onScroll} aria-live="polite">
        {messages.length === 0 && (
          <div className="chat-welcome fade-in">
            <h2>Salom, {name}! Nimani o‘rganamiz?</h2>
            <p>IT, dasturlash, karyera yoki o‘quv rejangiz bo‘yicha istalgan savolni bering. Tushunmasangiz — “soddaroq tushuntir” deng.</p>
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="suggestion" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="bubble user">
              {m.content}
            </div>
          ) : (
            <div
              key={m.id}
              className="bubble ai"
              style={m.error ? { background: "var(--danger-bg)", color: "var(--danger)" } : undefined}
            >
              {m.content ? (
                <Markdown text={m.content} />
              ) : (
                <span className="typing" aria-label="Javob yozilmoqda">
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </div>
          )
        )}
      </div>

      <div className="chat-input">
        <form
          className="chat-box"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <label htmlFor="chat-input" className="sr-only">
            Savolingiz
          </label>
          <textarea
            id="chat-input"
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Savolingizni yozing…"
            maxLength={2000}
            autoFocus={!!prefill}
          />
          {busy ? (
            <button type="button" className="send-btn" onClick={() => abortRef.current?.abort()} aria-label="To‘xtatish">
              <Square size={16} fill="currentColor" />
            </button>
          ) : (
            <button type="submit" className="send-btn" disabled={!input.trim()} aria-label="Yuborish">
              <ArrowUp size={20} />
            </button>
          )}
        </form>
        <p className="chat-note">AI xato qilishi mumkin — muhim ma’lumotlarni rasmiy manbalardan tekshiring.</p>
      </div>
        </>
      )}
    </div>
  );
}
