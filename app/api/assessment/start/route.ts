import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { completeJSON } from "@/lib/ai";
import { FALLBACK_QUESTIONS, questionsPrompt, toPublic, validateQuestions, type Question } from "@/lib/assessment";
import { fail, handleError } from "@/lib/http";

export const maxDuration = 90;

const DAILY_LIMIT = 6;

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Avval tizimga kiring.", 401);

    const recent = await queryOne<{ n: number }>(
      "SELECT COUNT(*)::int AS n FROM assessments WHERE user_id = $1 AND created_at > now() - interval '24 hours'",
      [user.id]
    );
    if ((recent?.n ?? 0) >= DAILY_LIMIT) {
      return fail("Bugun testni yetarlicha topshirdingiz. Ertaga yana urinib ko‘ring.", 429);
    }

    let questions: Question[];
    let source = "ai";
    try {
      questions = await completeJSON(questionsPrompt(user), validateQuestions, {
        temperature: 0.9,
        maxTokens: 6000,
        timeoutMs: 40_000,
        deadline: Date.now() + 80_000,
      });
    } catch (err) {
      // AI ishlamasa ham test to'xtab qolmasin — tayyor savollar bilan davom etamiz
      console.warn("[assessment] AI savollar yaratmadi, zaxira savollar ishlatiladi:", err);
      questions = FALLBACK_QUESTIONS;
      source = "fallback";
    }

    const rows = await query<{ id: number }>(
      "INSERT INTO assessments (user_id, questions, source) VALUES ($1, $2::jsonb, $3) RETURNING id",
      [user.id, JSON.stringify(questions), source]
    );

    return NextResponse.json({ id: rows[0].id, questions: toPublic(questions), source });
  } catch (err) {
    return handleError(err);
  }
}
