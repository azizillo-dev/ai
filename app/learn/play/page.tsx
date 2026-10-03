import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getField } from "@/lib/catalog";
import { fieldTopics } from "@/lib/lessons";
import LessonPlayer from "./LessonPlayer";

export const metadata: Metadata = { title: "Video-dars" };

export default async function PlayPage({ searchParams }: { searchParams: Promise<{ field?: string; topic?: string }> }) {
  const sp = await searchParams;
  const field = getField(String(sp.field ?? ""));
  const topic = String(sp.topic ?? "").trim().slice(0, 160);
  await requireUser(`/learn/play?field=${encodeURIComponent(sp.field ?? "")}&topic=${encodeURIComponent(topic)}`);
  if (!field || !topic) notFound();

  const topics = fieldTopics(field);
  const idx = topics.findIndex((t) => t.toLowerCase() === topic.toLowerCase());
  const next = idx >= 0 && idx < topics.length - 1 ? topics[idx + 1] : null;

  return <LessonPlayer field={{ id: field.id, title: field.title }} topic={topic} nextTopic={next} />;
}
