import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { transcribe } from "@/lib/stt";
import { takeQuota } from "@/lib/usage";
import { fail, handleError } from "@/lib/http";

export const maxDuration = 60;

const MAX_BYTES = 2_500_000; // ~75 soniya 16 kHz WAV

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Avval tizimga kiring.", 401);

    const buf = Buffer.from(await req.arrayBuffer());
    if (buf.length < 1000) return fail("Ovoz juda qisqa. Qayta urinib ko‘ring.");
    if (buf.length > MAX_BYTES) return fail("Ovoz juda uzun. Qisqaroq gapiring.", 413);
    if (buf.subarray(0, 4).toString("ascii") !== "RIFF") return fail("Noto‘g‘ri audio format.");

    if (!(await takeQuota(session.uid, "stt"))) return fail("Bugungi ovozli savollar limiti tugadi. Yozib yuborishingiz mumkin.", 429);

    const text = await transcribe(buf);
    return NextResponse.json({ text });
  } catch (err) {
    return handleError(err);
  }
}
