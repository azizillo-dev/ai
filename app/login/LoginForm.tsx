"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Kirishda xatolik yuz berdi.");
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kirishda xatolik yuz berdi.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-card fade-in">
      <h1>Qaytganingizdan xursandmiz</h1>
      <p className="sub">Akkauntingizga kiring va o‘rganishni davom ettiring.</p>

      <form className="form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            className="input"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="masalan: malika_dev"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Parol</label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="alert" role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}

        <button className="btn btn-primary btn-lg btn-block" disabled={loading || !username || !password}>
          {loading ? <span className="spinner" /> : <>Kirish <ArrowRight size={18} /></>}
        </button>
      </form>

      <p className="form-foot">
        Akkauntingiz yo‘qmi?{" "}
        <Link href="/register" className="link">
          Ro‘yxatdan o‘ting
        </Link>
      </p>
    </div>
  );
}
