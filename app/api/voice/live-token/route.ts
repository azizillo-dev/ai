import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { env } from "@/lib/env";
import { mentorSystemPrompt } from "@/lib/mentor";
import { CHARACTERS, isCharacterId } from "@/lib/characters";
import type { AssessmentResult } from "@/lib/assessment";
import { takeQuota } from "@/lib/usage";
import { fail, handleError, readJSON } from "@/lib/http";

/**
 * Real vaqtdagi ovozli suhbat (Gemini Live) uchun bir martalik token.
 * API kalit brauzerga chiqmaydi; xarakter, ovoz va ko'rsatmalar token ichida qulflanadi —
 * brauzer ularni o'zgartira olmaydi.
 */

const MODELS = (env("LIVE_MODEL") || "gemini-3.8-live,gemini-3.1-flash-live-preview,gemini-2.5-flash-native-audio-latest")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Avval tizimga kiring.", 401);
    if (!env("GEMINI_API_KEY")) return fail("Ovozli suhbat uchun GEMINI_API_KEY kerak.", 500);

    const body = (await readJSON(req)) as { character?: unknown; attempt?: unknown } | null;
    const character = CHARACTERS[isCharacterId(body?.character) ? body.character : "madina"];
    const attempt = Math.max(0, Math.min(MODELS.length - 1, Number(body?.attempt) || 0));
    const model = `models/${MODELS[attempt]}`;

    if (!(await takeQuota(user.id, "live"))) return fail("Bugungi ovozli suhbatlar limiti tugadi. Yozma suhbatdan foydalaning.", 429);

    const latest = await queryOne<{ result: AssessmentResult }>(
      "SELECT result FROM assessments WHERE user_id = $1 AND result IS NOT NULL ORDER BY id DESC LIMIT 1",
      [user.id]
    );
    const instructions = mentorSystemPrompt(user, latest?.result ?? null, { voice: true, persona: character.name });

    const now = Date.now();
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/auth_tokens", {
      method: "POST",
      headers: { "x-goog-api-key": env("GEMINI_API_KEY"), "Content-Type": "application/json" },
      body: JSON.stringify({
        uses: 1,
        expireTime: new Date(now + 30 * 60_000).toISOString(),
        newSessionExpireTime: new Date(now + 2 * 60_000).toISOString(),
        bidiGenerateContentSetup: {
          model,
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: character.voice } } },
          },
          systemInstruction: { parts: [{ text: instructions }] },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const data = (await res.json().catch(() => ({}))) as { name?: string };
    if (!res.ok || !data.name) {
      console.error("[live] token yaratilmadi:", res.status, JSON.stringify(data).slice(0, 200));
      return fail("Ovozli suhbatni boshlab bo‘lmadi. Birozdan so‘ng qayta urinib ko‘ring.", 503);
    }

    return NextResponse.json({ token: data.name, model, hasMore: attempt < MODELS.length - 1 });
  } catch (err) {
    return handleError(err);
  }
}
