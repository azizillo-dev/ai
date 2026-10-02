"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, Clock, ListChecks, Sparkles } from "lucide-react";

interface Question {
  id: number;
  dimension: string;
  question: string;
  options: string[];
}

type Phase = "intro" | "loading" | "questions" | "about" | "analyzing" | "error";

const DIM_LABEL: Record<string, string> = {
  qiziqish: "Qiziqishlar",
  mantiq: "Mantiqiy fikrlash",
  ijodkorlik: "Ijodkorlik",
  texnik: "Texnik yondashuv",
  ishlash_uslubi: "Ishlash uslubi",
  motivatsiya: "Motivatsiya",
};

const KEYS = ["A", "B", "C", "D", "E"];

const ANALYZE_STEPS = [
  "Javoblaringiz o‘qilmoqda",
  "Qobiliyat va qiziqishlar baholanmoqda",
  "IT yo‘nalishlari bilan solishtirilmoqda",
  "Shaxsiy yo‘l xaritasi tuzilmoqda",
];

export default function AssessmentFlow({ name, retake }: { name: string; retake: boolean }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [assessmentId, setAssessmentId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [source, setSource] = useState<string>("ai");
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [about, setAbout] = useState("");
  const [error, setError] = useState("");
  const [errorRetry, setErrorRetry] = useState<"start" | "submit">("start");
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const advanceTimer = useRef<number | undefined>(undefined);

  const start = async () => {
    setPhase("loading");
    setError("");
    try {
      const res = await fetch("/api/assessment/start", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Savollarni yuklab bo‘lmadi.");
      setAssessmentId(data.id);
      setQuestions(data.questions);
      setSource(data.source);
      setAnswers(new Array(data.questions.length).fill(-1));
      setCurrent(0);
      setPhase("questions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi.");
      setErrorRetry("start");
      setPhase("error");
    }
  };

  const submit = async () => {
    if (assessmentId === null) return;
    setPhase("analyzing");
    setAnalyzeStep(0);
    setError("");
    try {
      const res = await fetch(`/api/assessment/${assessmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, about }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Tahlil qilib bo‘lmadi.");
      setAnalyzeStep(ANALYZE_STEPS.length);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi.");
      setErrorRetry("submit");
      setPhase("error");
    }
  };

  // Tahlil vaqtida bosqichlarni navbatma-navbat ko'rsatish
  useEffect(() => {
    if (phase !== "analyzing") return;
    const id = window.setInterval(() => setAnalyzeStep((s) => Math.min(s + 1, ANALYZE_STEPS.length - 1)), 2600);
    return () => window.clearInterval(id);
  }, [phase]);

  const choose = useCallback(
    (optionIndex: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[current] = optionIndex;
        return next;
      });
      // Tanlangandan so'ng keyingi savolga avtomatik o'tish
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(() => {
        if (current < questions.length - 1) setCurrent((c) => c + 1);
        else setPhase("about");
      }, 280);
    },
    [current, questions.length]
  );

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  // Klaviatura: A–D yoki 1–4 bilan tanlash, chap strelka — orqaga
  useEffect(() => {
    if (phase !== "questions") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const q = questions[current];
      if (!q) return;
      const k = e.key.toUpperCase();
      let idx = KEYS.indexOf(k);
      if (idx < 0 && /^[1-5]$/.test(k)) idx = Number(k) - 1;
      if (idx >= 0 && idx < q.options.length) {
        e.preventDefault();
        choose(idx);
      } else if (e.key === "ArrowLeft" && current > 0) {
        setCurrent((c) => c - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, current, questions, choose]);

  /* ----------------------------- Render ----------------------------- */

  if (phase === "intro") {
    return (
      <div className="test-wrap fade-in">
        <span className="eyebrow">AI diagnostika</span>
        <h1 className="h-section">{retake ? "Testni qayta topshirish" : `${name}, keling, yo‘lingizni topamiz`}</h1>
        <p className="lead" style={{ marginTop: 14 }}>
          Sun’iy intellekt profilingizga qarab siz uchun maxsus savollar tuzadi, so‘ng javoblaringizni tahlil qilib eng mos IT
          yo‘nalishlari va shaxsiy o‘quv rejangizni tayyorlaydi.
        </p>
        <ul className="check-list" style={{ marginTop: 32 }}>
          <li>
            <span className="icon-box">
              <ListChecks size={19} />
            </span>
            <div>
              <strong>10 ta savol</strong>
              <span>Qiziqish, mantiq, ijodkorlik, texnik yondashuv va ishlash uslubi bo‘yicha.</span>
            </div>
          </li>
          <li>
            <span className="icon-box">
              <Clock size={19} />
            </span>
            <div>
              <strong>Taxminan 5 daqiqa</strong>
              <span>Har bir savolda bitta variantni tanlaysiz. Klaviaturada A–D tugmalari ham ishlaydi.</span>
            </div>
          </li>
          <li>
            <span className="icon-box">
              <Sparkles size={19} />
            </span>
            <div>
              <strong>Samimiy javob bering</strong>
              <span>Mantiq savollaridan tashqari “to‘g‘ri” yoki “noto‘g‘ri” javob yo‘q — o‘zingizga yaqinini tanlang.</span>
            </div>
          </li>
        </ul>
        <div className="hero-cta" style={{ marginTop: 36 }}>
          <button className="btn btn-primary btn-lg" onClick={start}>
            Testni boshlash <ArrowRight size={18} />
          </button>
          {retake && (
            <Link href="/dashboard" className="btn btn-outline btn-lg">
              Natijamga qaytish
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="test-wrap">
        <div className="center-state fade-in" aria-live="polite">
          <div className="pulse-orb">
            <Sparkles size={30} />
          </div>
          <h2>Savollar tayyorlanmoqda</h2>
          <p>Sun’iy intellekt profilingizni o‘rganib, siz uchun maxsus savollar tuzmoqda. Bu bir necha soniya oladi.</p>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="test-wrap">
        <div className="center-state fade-in" role="alert">
          <span className="icon-box" style={{ background: "var(--danger-bg)", color: "var(--danger)", width: 56, height: 56 }}>
            <AlertCircle size={26} />
          </span>
          <h2>Nimadir xato ketdi</h2>
          <p>{error}</p>
          <div className="hero-cta" style={{ marginTop: 8, justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={errorRetry === "submit" ? submit : start}>
              Qayta urinish
            </button>
            {errorRetry === "submit" && (
              <button className="btn btn-outline" onClick={() => setPhase("about")}>
                Javoblarga qaytish
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "analyzing") {
    return (
      <div className="test-wrap">
        <div className="center-state fade-in" aria-live="polite">
          <div className="pulse-orb">
            <Sparkles size={30} />
          </div>
          <h2>AI javoblaringizni tahlil qilmoqda</h2>
          <p>Bu odatda 10–30 soniya davom etadi. Sahifani yopmang.</p>
          <ul className="load-steps">
            {ANALYZE_STEPS.map((s, i) => (
              <li key={s} className={i < analyzeStep ? "done" : i === analyzeStep ? "on" : ""}>
                {i < analyzeStep ? <Check size={18} /> : i === analyzeStep ? <span className="spinner" /> : <span style={{ width: 18 }} />}
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const total = questions.length;
  const answered = answers.filter((a) => a >= 0).length;

  if (phase === "about") {
    return (
      <div className="test-wrap fade-in">
        <div className="test-progress">
          <span>Oxirgi qadam</span>
          <div className="bar">
            <i style={{ width: "100%" }} />
          </div>
        </div>
        <span className="q-dim">Ixtiyoriy</span>
        <h1 className="q-title">O‘zingiz haqingizda yana nimadir qo‘shmoqchimisiz?</h1>
        <div className="field">
          <label htmlFor="about" className="sr-only">
            O‘zingiz haqingizda
          </label>
          <textarea
            id="about"
            className="textarea"
            maxLength={600}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Masalan: matematikani yaxshi ko‘raman, rasm chizishni yoqtiraman, kelajakda tibbiyotga foydali dastur yaratmoqchiman…"
          />
          <span className="hint">Bu tahlilni yanada aniqroq qiladi. {600 - about.length} ta belgi qoldi.</span>
        </div>
        <div className="test-nav">
          <button
            className="btn btn-outline"
            onClick={() => {
              setCurrent(total - 1);
              setPhase("questions");
            }}
          >
            <ArrowLeft size={18} /> Orqaga
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={answered < total}>
            Tahlil qilish <Sparkles size={17} />
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div className="test-wrap">
      <div className="test-progress">
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          {current + 1} / {total}
        </span>
        <div
          className="bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={answered}
          aria-label="Test jarayoni"
        >
          <i style={{ width: `${(answered / total) * 100}%` }} />
        </div>
      </div>

      {source === "fallback" && current === 0 && (
        <div className="alert info" style={{ marginBottom: 20 }}>
          <Sparkles size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          AI hozir band edi, shuning uchun standart savollar berildi. Javoblaringiz baribir sun’iy intellekt tomonidan tahlil qilinadi.
        </div>
      )}

      <div key={q.id} className="fade-in">
        <span className="q-dim">{DIM_LABEL[q.dimension] ?? "Savol"}</span>
        <h1 className="q-title">{q.question}</h1>
        <div className="options" role="radiogroup" aria-label={q.question}>
          {q.options.map((opt, i) => (
            <button
              key={i}
              role="radio"
              aria-checked={answers[current] === i}
              className="option"
              onClick={() => choose(i)}
            >
              <span className="key">{KEYS[i]}</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="test-nav">
        <button className="btn btn-ghost" onClick={() => setCurrent((c) => c - 1)} disabled={current === 0}>
          <ArrowLeft size={18} /> Orqaga
        </button>
        <button
          className="btn btn-outline"
          onClick={() => (current < total - 1 ? setCurrent((c) => c + 1) : setPhase("about"))}
          disabled={answers[current] < 0}
        >
          Keyingi <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
