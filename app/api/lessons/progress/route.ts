import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { fail, handleError, readJSON } from "@/lib/http";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Avval tizimga kiring.", 401);
    const body = (await readJSON(req)) as { key?: unknown; score?: unknown; total?: unknown } | null;
    const key = typeof body?.key === "string" && /^[a-f0-9]{24}$/.test(body.key) ? body.key : "";
    const total = Math.max(0, Math.min(10, Number(body?.total) || 0));
    const score = Math.max(0, Math.min(total, Number(body?.score) || 0));
    if (!key) return fail("Noto‘g‘ri dars.");

    await query(
      `INSERT INTO lesson_progress (user_id, lesson_key, score, total) VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, lesson_key) DO UPDATE SET score = GREATEST(lesson_progress.score, EXCLUDED.score), total = EXCLUDED.total, completed_at = now()`,
      [session.uid, key, score, total]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
