import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { completeJSON } from "@/lib/ai";
import { analysisPrompt, validateResult, type Question } from "@/lib/assessment";
import { fail, handleError, readJSON } from "@/lib/http";

export const maxDuration = 120;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Avval tizimga kiring.", 401);

    const id = Number((await params).id);
    if (!Number.isInteger(id)) return fail("Test topilmadi.", 404);

    const row = await queryOne<{ questions: Question[]; finished_at: string | null }>(
      "SELECT questions, finished_at FROM assessments WHERE id = $1 AND user_id = $2",
      [id, user.id]
    );
    if (!row) return fail("Test topilmadi.", 404);
    if (row.finished_at) return NextResponse.json({ ok: true }); // allaqachon tahlil qilingan

    const body = (await readJSON(req)) as { answers?: unknown; about?: unknown } | null;
    const questions = row.questions;
    const answers = Array.isArray(body?.answers) ? body.answers.map((a) => (Number.isInteger(a) ? (a as number) : -1)) : [];
    if (answers.length !== questions.length || answers.some((a, i) => a < 0 || a >= questions[i].options.length)) {
      return fail("Iltimos, barcha savollarga javob bering.");
    }
    const about = typeof body?.about === "string" ? body.about.slice(0, 600) : "";

    const logicQs = questions.map((q, i) => ({ q, a: answers[i] })).filter(({ q }) => q.correct !== undefined);
    const logic = { correct: logicQs.filter(({ q, a }) => q.correct === a).length, total: logicQs.length };

    const result = await completeJSON(analysisPrompt(user, questions, answers, about, logic), validateResult, {
      temperature: 0.5,
      maxTokens: 8000,
      timeoutMs: 60_000,
      deadline: Date.now() + 100_000,
    });
    if (logic.total > 0) result.logic_score = logic;

    await query(
      "UPDATE assessments SET answers = $1::jsonb, result = $2::jsonb, finished_at = now() WHERE id = $3 AND user_id = $4",
      [JSON.stringify({ answers, about }), JSON.stringify(result), id, user.id]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
