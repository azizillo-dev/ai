import "server-only";
import { createHash } from "node:crypto";
import { Mp3Encoder } from "@breezystack/lamejs";
import { AIError } from "./ai";
import { env } from "./env";
import { query, queryOne } from "./db";

/**
 * Matnni o'zbekcha ovozga aylantirish (Gemini TTS).
 * Natija MP3 (48 kbps, mono) ga siqiladi va bazada keshlanadi — bir xil matn qayta so'ralsa,
 * AI kvotasi sarflanmaydi (darslar uchun ayniqsa muhim).
 */

const MODELS = (env("TTS_MODEL") || "gemini-3.8-flash-tts,gemini-3.8-flash-lite-tts,gemini-2.5-flash-preview-tts")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const VOICE = env("TTS_VOICE") || "Kore";
export const TTS_MAX_CHARS = 700;

const cooldown = new Map<string, number>();

export function ttsKey(text: string): string {
  return createHash("sha256").update(`${VOICE}|${normalize(text)}`).digest("hex").slice(0, 40);
}

/** Ovoz uchun matnni tozalash: markdown belgilarini olib tashlash */
export function normalize(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/[*_#>]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getCached(key: string): Promise<Buffer | null> {
  const row = await queryOne<{ audio: string }>("SELECT audio FROM tts_cache WHERE key = $1", [key]);
  return row ? Buffer.from(row.audio, "base64") : null;
}

/** WAV yoki xom L16 dan PCM namunalarini ajratish */
function toPcm(data: Buffer, mime: string): { samples: Int16Array; rate: number } {
  if (data.subarray(0, 4).toString("ascii") === "RIFF") {
    let rate = 24000;
    let offset = 12;
    while (offset + 8 <= data.length) {
      const id = data.subarray(offset, offset + 4).toString("ascii");
      const size = data.readUInt32LE(offset + 4);
      if (id === "fmt ") rate = data.readUInt32LE(offset + 12);
      if (id === "data") {
        const pcm = data.subarray(offset + 8, Math.min(data.length, offset + 8 + size));
        return { samples: new Int16Array(pcm.buffer.slice(pcm.byteOffset, pcm.byteOffset + (pcm.length & ~1))), rate };
      }
      offset += 8 + size + (size & 1);
    }
    throw new Error("WAV ichida audio topilmadi");
  }
  const rate = Number(/rate=(\d+)/i.exec(mime)?.[1] ?? 24000);
  return { samples: new Int16Array(data.buffer.slice(data.byteOffset, data.byteOffset + (data.length & ~1))), rate };
}

function encodeMp3(samples: Int16Array, rate: number): Buffer {
  const encoder = new Mp3Encoder(1, rate, 48);
  const chunks: Uint8Array[] = [];
  const BLOCK = 1152;
  for (let i = 0; i < samples.length; i += BLOCK) {
    const out = encoder.encodeBuffer(samples.subarray(i, i + BLOCK));
    if (out.length) chunks.push(out);
  }
  const end = encoder.flush();
  if (end.length) chunks.push(end);
  return Buffer.concat(chunks.map((c) => Buffer.from(c)));
}

async function callGemini(model: string, text: string): Promise<{ data: Buffer; mime: string }> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": env("GEMINI_API_KEY") },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
      },
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    const body = (await res.text()).replace(/\s+/g, " ").slice(0, 160);
    const err = new Error(`${res.status} ${body}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] } }[];
  };
  const inline = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData;
  if (!inline?.data) throw new Error("audio qaytmadi");
  return { data: Buffer.from(inline.data, "base64"), mime: inline.mimeType ?? "" };
}

/** Matn → MP3. Keshda bo'lsa darhol qaytaradi. */
export async function synthesize(text: string): Promise<{ audio: Buffer; cached: boolean; key: string }> {
  const clean = normalize(text).slice(0, TTS_MAX_CHARS);
  if (!clean) throw new AIError("Ovoz uchun matn bo‘sh.", 400);
  const key = ttsKey(clean);

  const hit = await getCached(key);
  if (hit) return { audio: hit, cached: true, key };

  if (!env("GEMINI_API_KEY")) throw new AIError("Ovoz uchun GEMINI_API_KEY kerak.", 500);

  const errors: string[] = [];
  const now = Date.now();
  const ordered = [...MODELS.filter((m) => (cooldown.get(m) ?? 0) <= now), ...MODELS.filter((m) => (cooldown.get(m) ?? 0) > now)];
  for (const model of ordered) {
    try {
      const { data, mime } = await callGemini(model, clean);
      const { samples, rate } = toPcm(data, mime);
      const audio = encodeMp3(samples, rate);
      await query("INSERT INTO tts_cache (key, audio) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING", [key, audio.toString("base64")]);
      return { audio, cached: false, key };
    } catch (err) {
      const status = (err as { status?: number }).status ?? 503;
      if (status === 429 || status >= 500) cooldown.set(model, Date.now() + 30_000);
      errors.push(`${model}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  console.error("[tts] ovoz yaratilmadi:", errors.join(" | "));
  throw new AIError("Ovoz hozircha yaratilmadi (AI band). Matnni o‘qib turing.");
}
