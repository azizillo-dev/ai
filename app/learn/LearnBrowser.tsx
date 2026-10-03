"use client";

import Link from "next/link";
import { useState } from "react";
import { CircleCheck, Play, Sparkles, Zap } from "lucide-react";

export interface TopicItem {
  field: string;
  topic: string;
  key: string;
  done: { score: number; total: number } | null;
  ready: boolean;
  note?: string;
}

function TopicCard({ t, index }: { t: TopicItem; index: number }) {
  const href = `/learn/play?field=${encodeURIComponent(t.field)}&topic=${encodeURIComponent(t.topic)}`;
  return (
    <Link href={href} className="card card-hover lesson-card">
      <div className="lesson-top">
        <span className="lesson-num">{String(index + 1).padStart(2, "0")}</span>
        {t.done ? (
          <span className="tag" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
            <CircleCheck size={13} /> {t.done.score}/{t.done.total}
          </span>
        ) : t.ready ? (
          <span className="tag">
            <Zap size={13} /> Tayyor
          </span>
        ) : (
          <span className="tag" style={{ background: "var(--bg-tint)", color: "var(--ink-3)" }}>
            <Sparkles size={13} /> AI tayyorlaydi
          </span>
        )}
      </div>
      <h3>{t.topic}</h3>
      {t.note && <span className="muted" style={{ fontSize: 13 }}>{t.note}</span>}
      <span className="more">
        <Play size={14} fill="currentColor" /> {t.done ? "Qayta ko‘rish" : "Ko‘rish"}
      </span>
    </Link>
  );
}

export default function LearnBrowser({
  roadmap,
  roadmapTitle,
  fields,
  suggested,
}: {
  roadmap: TopicItem[];
  roadmapTitle: string;
  fields: { id: string; title: string; topics: TopicItem[] }[];
  suggested: string[];
}) {
  const [fieldId, setFieldId] = useState(suggested[0] ?? "frontend");
  const field = fields.find((f) => f.id === fieldId) ?? fields[0];
  const quick = [...new Set([...suggested, "frontend", "ai", "uiux"])].slice(0, 4);

  return (
    <>
      {roadmap.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2 className="h-section" style={{ fontSize: "clamp(22px, 3vw, 28px)" }}>
            Mening yo‘l xaritam
          </h2>
          <p className="muted" style={{ margin: "6px 0 20px" }}>
            {roadmapTitle} — test natijangiz asosida tuzilgan bosqichlar
          </p>
          <div className="grid-3">
            {roadmap.map((t, i) => (
              <TopicCard key={t.key} t={t} index={i} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="h-section" style={{ fontSize: "clamp(22px, 3vw, 28px)", marginBottom: 16 }}>
          Yo‘nalish bo‘yicha mavzular
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 24 }}>
          <div className="chips" style={{ margin: 0 }}>
            {quick.map((id) => {
              const f = fields.find((x) => x.id === id);
              return f ? (
                <button key={id} className="chip" aria-pressed={fieldId === id} onClick={() => setFieldId(id)}>
                  {f.title}
                </button>
              ) : null;
            })}
          </div>
          <label className="sr-only" htmlFor="field-select">
            Boshqa yo‘nalish
          </label>
          <select id="field-select" className="select" style={{ width: "auto", minWidth: 220, height: 38 }} value={fieldId} onChange={(e) => setFieldId(e.target.value)}>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
        </div>
        <div className="grid-3">
          {field.topics.map((t, i) => (
            <TopicCard key={t.key} t={t} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
