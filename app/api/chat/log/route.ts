import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { fail, handleError, readJSON } from "@/lib/http";

/** Real vaqtdagi ovozli suhbat matnini (transkripsiya) tarixga yozish */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Avval tizimga kiring.", 401);
    const body = (await readJSON(req)) as { question?: unknown; answer?: unknown } | null;
    const q = typeof body?.question === "string" ? body.question.trim().slice(0, 2000) : "";
    const a = typeof body?.answer === "string" ? body.answer.trim().slice(0, 4000) : "";
    if (!q || !a) return fail("Bo‘sh yozuv.");
    await query("INSERT INTO chat_messages (user_id, role, content) VALUES ($1, 'user', $2), ($1, 'assistant', $3)", [session.uid, q, a]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
