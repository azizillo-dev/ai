"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import { EDUCATION, GOALS, INTERESTS, SKILL_LEVELS, USERNAME_RE, WEEKLY_HOURS } from "@/lib/profile";

type FieldName = "name" | "username" | "password" | "age" | "education" | "skill_level" | "interests" | "goal" | "weekly_hours";

const STEP1: FieldName[] = ["name", "username", "password"];

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    age: "",
    education: "",
    skill_level: "",
    interests: [] as string[],
    goal: "",
    weekly_hours: 10 as number,
  });
  const [error, setError] = useState<{ field?: FieldName; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (error?.field === key) setError(null);
  };

  const toggleInterest = (val: string) =>
    set("interests", form.interests.includes(val) ? form.interests.filter((i) => i !== val) : [...form.interests, val]);

  const validateStep1 = (): boolean => {
    if (form.name.trim().length < 2) return fail("name", "Ismingizni kiriting.");
    if (!USERNAME_RE.test(form.username.trim().toLowerCase()))
      return fail("username", "Username 3–24 belgi: lotin harflari, raqam, _ yoki . bo‘lishi mumkin.");
    if (form.password.length < 6) return fail("password", "Parol kamida 6 belgidan iborat bo‘lsin.");
    return true;
  };

  function fail(field: FieldName, message: string) {
    setError({ field, message });
    document.getElementById(field)?.focus();
    return false;
  }

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const age = Number(form.age);
    if (!Number.isInteger(age) || age < 10 || age > 70) return void fail("age", "Yoshingizni to‘g‘ri kiriting (10–70).");
    if (!form.education) return void fail("education", "Ta’lim darajasini tanlang.");
    if (!form.skill_level) return void fail("skill_level", "Bilim darajasini tanlang.");
    if (form.interests.length === 0) return void setError({ field: "interests", message: "Kamida bitta qiziqishni tanlang." });
    if (!form.goal) return void fail("goal", "Maqsadingizni tanlang.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, username: form.username.trim().toLowerCase(), age }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const field = data.field as FieldName | undefined;
        if (field && STEP1.includes(field)) setStep(1);
        setError({ field, message: data.error || "Ro‘yxatdan o‘tishda xatolik." });
        setLoading(false);
        return;
      }
      router.push("/test");
      router.refresh();
    } catch {
      setError({ message: "Tarmoq xatosi. Internet aloqasini tekshiring." });
      setLoading(false);
    }
  };

  const invalid = (f: FieldName) => (error?.field === f ? true : undefined);

  const errorBox = error ? (
      <div className="alert" role="alert">
        <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
        {error.message}
      </div>
    ) : null;

  return (
    <div className="auth-card fade-in" style={{ maxWidth: step === 2 ? 560 : 480 }}>
      <span className="eyebrow" style={{ marginBottom: 8 }}>
        {step}-qadam / 2
      </span>
      <h1>{step === 1 ? "Akkaunt yarating" : "O‘zingiz haqingizda"}</h1>
      <p className="sub">
        {step === 1
          ? "Bepul. Kirish uchun username va parol kifoya."
          : "AI savollarni va tahlilni aynan shu ma’lumotlarga moslab tuzadi."}
      </p>
      <div className="steps-ind" aria-hidden="true">
        <span className="on" />
        <span className={step === 2 ? "on" : ""} />
      </div>

      {step === 1 ? (
        <form className="form" onSubmit={next} noValidate>
          <div className="field">
            <label htmlFor="name">Ismingiz</label>
            <input
              id="name"
              className="input"
              autoComplete="given-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Masalan: Malika"
              aria-invalid={invalid("name")}
              maxLength={60}
            />
          </div>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              className="input"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={form.username}
              onChange={(e) => set("username", e.target.value.replace(/\s/g, ""))}
              placeholder="masalan: malika_dev"
              aria-invalid={invalid("username")}
              maxLength={24}
            />
            <span className="hint">Lotin harflari, raqamlar, _ va . — 3 dan 24 belgigacha</span>
          </div>
          <div className="field">
            <label htmlFor="password">Parol</label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              aria-invalid={invalid("password")}
              maxLength={100}
            />
            <span className="hint">Kamida 6 belgi</span>
          </div>
          {errorBox}
          <button className="btn btn-primary btn-lg btn-block">
            Davom etish <ArrowRight size={18} />
          </button>
        </form>
      ) : (
        <form className="form" onSubmit={submit} noValidate>
          <div className="row-2">
            <div className="field">
              <label htmlFor="age">Yoshingiz</label>
              <input
                id="age"
                className="input"
                type="number"
                inputMode="numeric"
                min={10}
                max={70}
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
                placeholder="Masalan: 17"
                aria-invalid={invalid("age")}
              />
            </div>
            <div className="field">
              <label htmlFor="education">Ta’lim</label>
              <select
                id="education"
                className="select"
                value={form.education}
                onChange={(e) => set("education", e.target.value)}
                aria-invalid={invalid("education")}
              >
                <option value="" disabled>
                  Tanlang
                </option>
                {EDUCATION.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="skill_level">IT bo‘yicha hozirgi bilimingiz</label>
            <select
              id="skill_level"
              className="select"
              value={form.skill_level}
              onChange={(e) => set("skill_level", e.target.value)}
              aria-invalid={invalid("skill_level")}
            >
              <option value="" disabled>
                Tanlang
              </option>
              {SKILL_LEVELS.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <span className="label" id="interests-label">
              Qiziqishlaringiz <span className="muted" style={{ fontWeight: 400 }}>— bir nechtasini tanlang</span>
            </span>
            <div className="toggle-grid" role="group" aria-labelledby="interests-label">
              {INTERESTS.map((v) => (
                <button
                  type="button"
                  key={v}
                  className="toggle"
                  aria-pressed={form.interests.includes(v)}
                  onClick={() => toggleInterest(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="goal">Asosiy maqsadingiz</label>
            <select id="goal" className="select" value={form.goal} onChange={(e) => set("goal", e.target.value)} aria-invalid={invalid("goal")}>
              <option value="" disabled>
                Tanlang
              </option>
              {GOALS.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <span className="label" id="hours-label">
              Haftasiga qancha vaqt ajrata olasiz?
            </span>
            <div className="toggle-grid" role="radiogroup" aria-labelledby="hours-label">
              {WEEKLY_HOURS.map((h) => (
                <button
                  type="button"
                  key={h.value}
                  className="toggle"
                  role="radio"
                  aria-checked={form.weekly_hours === h.value}
                  aria-pressed={form.weekly_hours === h.value}
                  onClick={() => set("weekly_hours", h.value)}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {errorBox}

          <div className="form-nav">
            <button type="button" className="btn btn-outline btn-lg" onClick={() => setStep(1)} disabled={loading} aria-label="Orqaga">
              <ArrowLeft size={18} />
            </button>
            <button className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : <>Akkaunt yaratish <ArrowRight size={18} /></>}
            </button>
          </div>
        </form>
      )}

      <p className="form-foot">
        Akkauntingiz bormi?{" "}
        <Link href="/login" className="link">
          Kirish
        </Link>
      </p>
    </div>
  );
}
