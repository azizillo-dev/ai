import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { CATALOG } from "@/lib/catalog";
import type { AssessmentResult } from "@/lib/assessment";
import { fieldTopics, lessonKey } from "@/lib/lessons";
import LearnBrowser, { type TopicItem } from "./LearnBrowser";

export const metadata: Metadata = { title: "Video-darslar" };

export default async function LearnPage() {
  const user = await requireUser("/learn");
  const [latest, progress, ready] = await Promise.all([
    queryOne<{ result: AssessmentResult }>(
      "SELECT result FROM assessments WHERE user_id = $1 AND result IS NOT NULL ORDER BY id DESC LIMIT 1",
      [user.id]
    ),
    query<{ lesson_key: string; score: number; total: number }>("SELECT lesson_key, score, total FROM lesson_progress WHERE user_id = $1", [user.id]),
    query<{ key: string }>("SELECT key FROM lessons"),
  ]);

  const done = new Map(progress.map((p) => [p.lesson_key, { score: p.score, total: p.total }]));
  const readySet = new Set(ready.map((r) => r.key));
  const item = (field: string, topic: string, extra: Partial<TopicItem> = {}): TopicItem => {
    const key = lessonKey(field, topic);
    return { field, topic, key, done: done.get(key) ?? null, ready: readySet.has(key), ...extra };
  };

  const top = latest?.result.directions ?? [];
  const roadmap = top[0] ? latest!.result.roadmap.map((s) => item(top[0].id, s.title, { note: s.duration })) : [];

  const fields = CATALOG.map((f) => ({
    id: f.id,
    title: f.title,
    topics: fieldTopics(f).map((t) => item(f.id, t)),
  }));

  return (
    <div className="container">
      <div className="page-head" style={{ maxWidth: 720 }}>
        <span className="eyebrow">Video-darslar</span>
        <h1>Ko‘rib o‘rganing</h1>
        <p>
          Mavzuni tanlang — Aziza uni qisqa animatsion dars sifatida ovoz bilan tushuntirib beradi. Oxirida 3 ta savollik mini-test
          bor.
        </p>
      </div>
      <div style={{ padding: "28px 0 88px" }}>
        <LearnBrowser
          roadmap={roadmap}
          roadmapTitle={top[0]?.title ?? ""}
          fields={fields}
          suggested={top.map((d) => d.id)}
        />
      </div>
    </div>
  );
}
