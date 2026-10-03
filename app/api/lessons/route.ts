import { after, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { completeJSON } from "@/lib/ai";
import { getField } from "@/lib/catalog";
import type { AssessmentResult } from "@/lib/assessment";
import { isAllowedTopic, lessonKey, lessonPrompt, validateLesson, type Lesson } from "@/lib/lessons";
import { splitForSpeech } from "@/lib/speech-split";
import { synthesize } from "@/lib/tts";
import { takeQuota } from "@/lib/usage";
import { fail, handleError, readJSON } from "@/lib/http";

export const maxDuration = 120;

/** Dars sahnalari ovozini oldindan tayyorlash — keyingi tomoshabinlar uchun darhol ijro etiladi */
async function warmAudio(lesson: Lesson) {
  const chunks = lesson.scenes.flatMap((s) => splitForSpeech(s.narration));
  for (const chunk of chunks) {
    try {
      await synthesize(chunk);
    } catch {
      return; // AI band — qolganini brauzer o'zi so'raydi
    }
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Avval tizimga kiring.", 401);

    const body = (await readJSON(req)) as { field?: unknown; topic?: unknown } | null;
    const fieldId = typeof body?.field === "string" ? body.field : "";
    const topic = typeof body?.topic === "string" ? body.topic.trim().slice(0, 160) : "";
    const field = getField(fieldId);
    if (!field || !topic) return fail("Mavzu topilmadi.", 404);

    const key = lessonKey(field.id, topic);
    const cached = await queryOne<{ data: Lesson }>("SELECT data FROM lessons WHERE key = $1", [key]);
    if (cached) return NextResponse.json({ key, lesson: cached.data });

    // Faqat katalogdagi yoki foydalanuvchining yo'l xaritasidagi mavzular
    const latest = await queryOne<{ result: AssessmentResult }>(
      "SELECT result FROM assessments WHERE user_id = $1 AND result IS NOT NULL ORDER BY id DESC LIMIT 1",
      [user.id]
    );
    if (!isAllowedTopic(field.id, topic, latest?.result.roadmap.map((r) => r.title) ?? [])) {
      return fail("Bu mavzu uchun dars mavjud emas.", 404);
    }
    if (!(await takeQuota(user.id, "lesson"))) return fail("Bugun yangi darslar limiti tugadi. Tayyor darslarni ko‘rishingiz mumkin.", 429);

    const lesson = await completeJSON(lessonPrompt(field, topic), validateLesson, {
      temperature: 0.7,
      maxTokens: 7000,
      timeoutMs: 50_000,
      deadline: Date.now() + 90_000,
    });
    await query("INSERT INTO lessons (key, field_id, topic, data) VALUES ($1, $2, $3, $4::jsonb) ON CONFLICT (key) DO NOTHING", [
      key,
      field.id,
      topic,
      JSON.stringify(lesson),
    ]);

    after(() => warmAudio(lesson));
    return NextResponse.json({ key, lesson });
  } catch (err) {
    return handleError(err);
  }
}
