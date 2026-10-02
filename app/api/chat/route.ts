import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { stream, type ChatMessage } from "@/lib/ai";
import { mentorSystemPrompt } from "@/lib/mentor";
import type { AssessmentResult } from "@/lib/assessment";
import { fail, handleError, readJSON } from "@/lib/http";

export const maxDuration = 60;

const DAILY_LIMIT = 80;
const HISTORY = 16;

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Avval tizimga kiring.", 401);

    const body = (await readJSON(req)) as { message?: unknown } | null;
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 2000) : "";
    if (!message) return fail("Xabar bo‘sh.");

    const used = await queryOne<{ n: number }>(
      "SELECT COUNT(*)::int AS n FROM chat_messages WHERE user_id = $1 AND role = 'user' AND created_at > now() - interval '24 hours'",
      [user.id]
    );
    if ((used?.n ?? 0) >= DAILY_LIMIT) {
      return fail("Bugungi savollar limiti tugadi. Ertaga davom etamiz!", 429);
    }

    const [history, latest] = await Promise.all([
      query<{ role: "user" | "assistant"; content: string }>(
        "SELECT role, content FROM chat_messages WHERE user_id = $1 ORDER BY id DESC LIMIT $2",
        [user.id, HISTORY]
      ),
      queryOne<{ result: AssessmentResult }>(
        "SELECT result FROM assessments WHERE user_id = $1 AND result IS NOT NULL ORDER BY id DESC LIMIT 1",
        [user.id]
      ),
    ]);

    const messages: ChatMessage[] = [
      { role: "system", content: mentorSystemPrompt(user, latest?.result ?? null) },
      ...history.reverse().map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const body$ = await stream(messages, { temperature: 0.6, maxTokens: 4000 }, async (full) => {
      await query("INSERT INTO chat_messages (user_id, role, content) VALUES ($1, 'user', $2), ($1, 'assistant', $3)", [
        user.id,
        message,
        full,
      ]);
    });

    return new Response(body$, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Avval tizimga kiring.", 401);
    await query("DELETE FROM chat_messages WHERE user_id = $1", [user.id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
