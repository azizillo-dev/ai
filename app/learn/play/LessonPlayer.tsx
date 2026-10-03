"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CircleCheck,
  CircleX,
  MessageCircle,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import VoiceAvatar from "@/components/VoiceAvatar";
import { getAudioContext, readLevel, SpeechQueue, splitForSpeech } from "@/lib/voice-client";
import SceneVisual, { type Visual } from "./Visuals";

interface Lesson {
  title: string;
  scenes: { title: string; narration: string; visual: Visual }[];
  quiz: { question: string; options: string[]; correct: number; explanation: string }[];
}

type Phase = "loading" | "error" | "ready" | "playing" | "paused" | "ended";

const LOAD_STEPS = ["Mavzu o‘rganilmoqda", "Ssenariy yozilmoqda", "Sahnalar va misollar tayyorlanmoqda", "Mini-test tuzilmoqda"];

export default function LessonPlayer({
  field,
  topic,
  nextTopic,
}: {
  field: { id: string; title: string };
  topic: string;
  nextTopic: string | null;
}) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [scene, setScene] = useState(0);
  const [caption, setCaption] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [note, setNote] = useState("");
  const [loadStep, setLoadStep] = useState(0);

  const queue = useRef<SpeechQueue | null>(null);
  const gen = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const buf = useRef(new Uint8Array(new ArrayBuffer(1024)));
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const getLevel = useCallback(() => readLevel(queue.current?.analyser ?? null, buf.current), []);

  /* ---------- Darsni yuklash ---------- */
  const load = useCallback(async () => {
    setPhase("loading");
    setError("");
    setLoadStep(0);
    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: field.id, topic }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Darsni tayyorlab bo‘lmadi.");
      setLesson(data.lesson);
      setKey(data.key);
      setScene(0);
      setCaption(data.lesson.scenes[0]?.narration ?? "");
      setPhase("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi.");
      setPhase("error");
    }
  }, [field.id, topic]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (phase !== "loading") return;
    const id = window.setInterval(() => setLoadStep((s) => Math.min(s + 1, LOAD_STEPS.length - 1)), 3500);
    return () => window.clearInterval(id);
  }, [phase]);

  const stopAudio = () => {
    gen.current++;
    window.clearTimeout(timer.current);
    queue.current?.stop();
    setSpeaking(false);
  };

  useEffect(() => () => stopAudio(), []);

  const getQueue = () => {
    if (!queue.current) {
      const q = new SpeechQueue();
      q.onStateChange = setSpeaking;
      q.onItemStart = (_i, text) => setCaption(text);
      q.onError = (m) => setNote(m);
      queue.current = q;
    }
    return queue.current;
  };

  /** Keyingi sahna ovozini oldindan tayyorlatish (server keshlaydi) */
  const prefetch = (text: string) => {
    if (mutedRef.current) return;
    for (const chunk of splitForSpeech(text)) {
      void fetch("/api/voice/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: chunk }) })
        .then((r) => r.body?.cancel())
        .catch(() => {});
    }
  };

  /* ---------- Sahnani ijro etish ---------- */
  const playScene = (i: number) => {
    if (!lesson) return;
    stopAudio();
    const my = gen.current;
    const s = lesson.scenes[i];
    setScene(i);
    setPhase("playing");
    setCaption(s.narration);

    const advance = () => {
      if (my !== gen.current) return;
      if (i < lesson.scenes.length - 1) playScene(i + 1);
      else {
        setPhase("ended");
        document.getElementById("lesson-quiz")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    if (lesson.scenes[i + 1]) prefetch(lesson.scenes[i + 1].narration);

    if (mutedRef.current) {
      timer.current = window.setTimeout(advance, Math.max(4000, s.narration.length * 60));
      return;
    }
    const q = getQueue();
    splitForSpeech(s.narration).forEach((c) => q.enqueue(c));
    void q.whenIdle().then(() => {
      if (my === gen.current) timer.current = window.setTimeout(advance, 900);
    });
  };

  const start = () => {
    getAudioContext();
    setNote("");
    playScene(0);
  };

  const togglePause = () => {
    if (phase === "playing") {
      stopAudio();
      setPhase("paused");
    } else if (phase === "paused" || phase === "ready") {
      getAudioContext();
      playScene(scene);
    } else if (phase === "ended") {
      start();
    }
  };

  const go = (i: number) => {
    if (!lesson) return;
    const target = Math.max(0, Math.min(lesson.scenes.length - 1, i));
    if (phase === "playing") playScene(target);
    else {
      stopAudio();
      setScene(target);
      setCaption(lesson.scenes[target].narration);
      if (phase === "ended") setPhase("paused");
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    mutedRef.current = next;
    if (phase === "playing") playScene(scene);
  };

  /* ---------- Render ---------- */
  const back = (
    <Link href="/learn" className="breadcrumb">
      <ArrowLeft size={15} /> Barcha darslar
    </Link>
  );

  if (phase === "loading" || phase === "error" || !lesson) {
    return (
      <div className="container lesson-wrap">
        {back}
        <div className="lesson-stage">
          <div className="stage-center">
            {phase === "error" ? (
              <>
                <AlertCircle size={34} />
                <h2>Darsni tayyorlab bo‘lmadi</h2>
                <p>{error}</p>
                <button className="btn btn-light" onClick={() => void load()}>
                  <RotateCcw size={16} /> Qayta urinish
                </button>
              </>
            ) : (
              <>
                <VoiceAvatar state="thinking" size={110} />
                <h2>{topic}</h2>
                <p aria-live="polite">{LOAD_STEPS[loadStep]}… Yangi dars bo‘lsa, 20–40 soniya oladi.</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const s = lesson.scenes[scene];
  const total = lesson.scenes.length;

  return (
    <div className="container lesson-wrap">
      {back}
      <div className="lesson-title-row">
        <div>
          <span className="eyebrow" style={{ marginBottom: 6 }}>
            {field.title}
          </span>
          <h1>{lesson.title}</h1>
        </div>
      </div>

      {/* ===== Sahna ===== */}
      <div className="lesson-stage">
        <div className="stage-top">
          <span>
            {scene + 1} / {total}
          </span>
        </div>

        {phase === "ready" ? (
          <div className="stage-center">
            <VoiceAvatar state="idle" size={120} />
            <h2>{lesson.title}</h2>
            <p>
              {total} ta sahna · taxminan {Math.max(2, Math.round(total * 0.4))} daqiqa · oxirida mini-test
            </p>
            <button className="btn btn-light btn-lg" onClick={start}>
              <Play size={18} fill="currentColor" /> Darsni boshlash
            </button>
          </div>
        ) : (
          <div key={scene} className="stage-scene">
            <h2 className="scene-title pop" style={{ "--i": 0 } as React.CSSProperties}>
              {s.title}
            </h2>
            <div className="scene-visual">
              <SceneVisual visual={s.visual} />
            </div>
          </div>
        )}

        {phase !== "ready" && (
          <div className="stage-bottom">
            <VoiceAvatar state={speaking ? "speaking" : "idle"} getLevel={getLevel} size={58} />
            <p className="stage-caption" aria-live="polite">
              {caption}
            </p>
          </div>
        )}
      </div>

      {/* ===== Boshqaruv ===== */}
      <div className="player-controls">
        <div className="scene-dots" role="tablist" aria-label="Sahnalar">
          {lesson.scenes.map((sc, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === scene}
              aria-label={`${i + 1}-sahna: ${sc.title}`}
              className={i < scene ? "seen" : i === scene ? "on" : ""}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <div className="player-buttons">
          <button className="round-btn" onClick={() => go(scene - 1)} disabled={scene === 0} aria-label="Oldingi sahna">
            <SkipBack size={18} />
          </button>
          <button className="mic-btn" style={{ width: 58, height: 58 }} onClick={togglePause} aria-label={phase === "playing" ? "Pauza" : "Davom ettirish"}>
            {phase === "playing" ? <Pause size={24} fill="currentColor" /> : phase === "ended" ? <RotateCcw size={22} /> : <Play size={24} fill="currentColor" />}
          </button>
          <button className="round-btn" onClick={() => go(scene + 1)} disabled={scene === total - 1} aria-label="Keyingi sahna">
            <SkipForward size={18} />
          </button>
          <button className="round-btn" aria-pressed={muted} onClick={toggleMute} aria-label={muted ? "Ovozni yoqish" : "Ovozsiz"}>
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>
      {note && (
        <div className="alert" style={{ marginTop: 12 }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          {note} Dars subtitrlar bilan davom etadi.
        </div>
      )}

      <Quiz lesson={lesson} lessonKey={key} topic={topic} field={field} nextTopic={nextTopic} />
    </div>
  );
}

/* ============================== Mini-test ============================== */

function Quiz({
  lesson,
  lessonKey,
  topic,
  field,
  nextTopic,
}: {
  lesson: Lesson;
  lessonKey: string;
  topic: string;
  field: { id: string; title: string };
  nextTopic: string | null;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => lesson.quiz.map(() => null));
  const done = answers.every((a) => a !== null);
  const score = answers.filter((a, i) => a === lesson.quiz[i].correct).length;
  const saved = useRef(false);

  useEffect(() => {
    if (!done || saved.current) return;
    saved.current = true;
    void fetch("/api/lessons/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: lessonKey, score, total: lesson.quiz.length }),
    }).catch(() => {});
  }, [done, score, lessonKey, lesson.quiz.length]);

  const yt = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${topic} o‘zbek tilida dars`)}`;

  return (
    <section id="lesson-quiz" className="quiz">
      <div className="card-head" style={{ marginBottom: 6 }}>
        <h2 className="h-section" style={{ fontSize: "clamp(22px, 3vw, 28px)" }}>
          Mini-test
        </h2>
        {done && (
          <span className="tag" style={score === lesson.quiz.length ? { background: "var(--success-bg)", color: "var(--success)" } : undefined}>
            {score} / {lesson.quiz.length}
          </span>
        )}
      </div>
      <p className="muted" style={{ marginBottom: 20 }}>
        Darsni qanchalik tushunganingizni tekshiring.
      </p>

      <div style={{ display: "grid", gap: 16 }}>
        {lesson.quiz.map((q, qi) => {
          const a = answers[qi];
          return (
            <div key={qi} className="card">
              <h3 style={{ fontSize: 16.5, marginBottom: 14 }}>
                {qi + 1}. {q.question}
              </h3>
              <div className="options">
                {q.options.map((opt, oi) => {
                  const state = a === null ? "" : oi === q.correct ? "right" : oi === a ? "wrong" : "";
                  return (
                    <button
                      key={oi}
                      className={`option ${state}`}
                      disabled={a !== null}
                      onClick={() => setAnswers((prev) => prev.map((x, i) => (i === qi ? oi : x)))}
                    >
                      <span className="key">{"ABCD"[oi]}</span>
                      <span style={{ flex: 1 }}>{opt}</span>
                      {state === "right" && <CircleCheck size={19} color="var(--success)" />}
                      {state === "wrong" && <CircleX size={19} color="var(--danger)" />}
                    </button>
                  );
                })}
              </div>
              {a !== null && q.explanation && <p className="quiz-expl">{q.explanation}</p>}
            </div>
          );
        })}
      </div>

      {done && (
        <div className="card advice fade-in" style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 18 }}>
            {score === lesson.quiz.length ? "Ajoyib! Hammasi to‘g‘ri." : score > 0 ? "Yaxshi natija!" : "Hechqisi yo‘q — qayta ko‘rib chiqing."}
          </h3>
          <p style={{ marginTop: 6 }}>Bilimni mustahkamlash uchun mavzuni mentor bilan muhokama qiling yoki o‘zbek tilidagi video darslarni ko‘ring.</p>
          <div className="hero-cta" style={{ marginTop: 16 }}>
            {nextTopic && (
              <Link href={`/learn/play?field=${encodeURIComponent(field.id)}&topic=${encodeURIComponent(nextTopic)}`} className="btn btn-primary">
                Keyingi mavzu <ArrowRight size={17} />
              </Link>
            )}
            <Link href={`/mentor?q=${encodeURIComponent(`“${topic}” mavzusini menga yana boshqa misol bilan tushuntiring`)}`} className="btn btn-outline">
              <MessageCircle size={16} /> Mentordan so‘rash
            </Link>
            <a href={yt} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              YouTube darslar <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      )}
      {!done && (
        <p className="muted" style={{ fontSize: 13, marginTop: 14, display: "flex", gap: 6, alignItems: "center" }}>
          <Sparkles size={14} /> Javob berganingiz zahoti to‘g‘ri javob va izoh ko‘rinadi.
        </p>
      )}
    </section>
  );
}
