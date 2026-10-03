import "server-only";
import { AIError } from "./ai";
import { env } from "./env";

/**
 * Ovozni matnga aylantirish. Kirish: 16 kHz mono WAV (brauzer tayyorlaydi).
 * 1) Gemini (audio kirish) — asosiy, kalit allaqachon bor
 * 2) Groq Whisper — zaxira (GROQ_API_KEY bo'lsa)
 */

const GEMINI_MODELS = ["gemini-flash-lite-latest", "gemini-flash-latest", "gemini-3.5-flash"];
const PROMPT =
  "Bu audioda odam gapiryapti (ko‘pincha o‘zbek tilida, lotin yozuvida yoz). Aytilgan gapni so‘zma-so‘z yozib ber. " +
  "Faqat matnni qaytar, izoh qo‘shma. Agar nutq bo‘lmasa yoki tushunarsiz bo‘lsa, bo‘sh javob qaytar.";

async function viaGemini(wav: Buffer): Promise<string> {
  const errors: string[] = [];
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${env("GEMINI_API_KEY")}` },
        body: JSON.stringify({
          model,
          temperature: 0,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: PROMPT },
                { type: "input_audio", input_audio: { data: wav.toString("base64"), format: "wav" } },
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(25_000),
      });
      if (!res.ok) {
        errors.push(`${model}: ${res.status}`);
        await res.body?.cancel();
        continue;
      }
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      return (data.choices?.[0]?.message?.content ?? "").trim();
    } catch (err) {
      errors.push(`${model}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  throw new Error(errors.join(" | "));
}

async function viaGroq(wav: Buffer): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(wav)], { type: "audio/wav" }), "audio.wav");
  form.append("model", "whisper-large-v3-turbo");
  form.append("language", "uz");
  form.append("response_format", "json");
  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${env("GROQ_API_KEY")}` },
    body: form,
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`groq ${res.status}`);
  const data = (await res.json()) as { text?: string };
  return (data.text ?? "").trim();
}

export async function transcribe(wav: Buffer): Promise<string> {
  const errors: string[] = [];
  if (env("GEMINI_API_KEY")) {
    try {
      return await viaGemini(wav);
    } catch (err) {
      errors.push(String(err));
    }
  }
  if (env("GROQ_API_KEY")) {
    try {
      return await viaGroq(wav);
    } catch (err) {
      errors.push(String(err));
    }
  }
  console.error("[stt] matnga aylantirilmadi:", errors.join(" | "));
  throw new AIError("Ovozingizni tanib bo‘lmadi. Qayta urinib ko‘ring yoki yozib yuboring.");
}
