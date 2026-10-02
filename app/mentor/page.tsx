import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import MentorChat from "./MentorChat";

export const metadata: Metadata = { title: "AI Mentor" };

export default async function MentorPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const user = await requireUser("/mentor");
  const q = (await searchParams).q;
  const rows = await query<{ id: number; role: "user" | "assistant"; content: string }>(
    "SELECT id, role, content FROM chat_messages WHERE user_id = $1 ORDER BY id DESC LIMIT 60",
    [user.id]
  );
  return (
    <MentorChat
      name={user.name}
      initial={rows.reverse().map((m) => ({ id: String(m.id), role: m.role, content: m.content }))}
      prefill={typeof q === "string" ? q.slice(0, 300) : ""}
    />
  );
}
