import { getSession } from "@/lib/auth";
import { getCached, normalize, synthesize, ttsKey, TTS_MAX_CHARS } from "@/lib/tts";
import { takeQuota } from "@/lib/usage";
import { fail, handleError, readJSON } from "@/lib/http";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Avval tizimga kiring.", 401);

    const body = (await readJSON(req)) as { text?: unknown } | null;
    const text = typeof body?.text === "string" ? normalize(body.text).slice(0, TTS_MAX_CHARS) : "";
    if (!text) return fail("Matn bo‘sh.");

    // Keshdagi ovoz kvotani sarflamaydi
    const cached = await getCached(ttsKey(text));
    let audio = cached;
    if (!audio) {
      if (!(await takeQuota(session.uid, "tts"))) return fail("Bugungi ovoz limiti tugadi. Matnni o‘qib turing.", 429);
      audio = (await synthesize(text)).audio;
    }

    return new Response(new Uint8Array(audio), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.length),
        "Cache-Control": "private, max-age=604800",
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
