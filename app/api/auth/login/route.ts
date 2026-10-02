import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { fail, handleError, readJSON } from "@/lib/http";

// Mavjud bo'lmagan foydalanuvchi uchun ham bir xil vaqt sarflash (username borligini bildirmaslik)
let dummyHash: string | undefined;
const getDummyHash = async () => (dummyHash ??= await bcrypt.hash("herpath-dummy", 10));

export async function POST(req: Request) {
  try {
    const body = (await readJSON(req)) as { username?: unknown; password?: unknown } | null;
    const username = typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (!username || !password) return fail("Username va parolni kiriting.");

    const user = await queryOne<{ id: number; name: string; username: string; password_hash: string }>(
      "SELECT id, name, username, password_hash FROM users WHERE username = $1",
      [username]
    );
    const ok = await bcrypt.compare(password, user?.password_hash ?? (await getDummyHash()));
    if (!user || !ok) return fail("Username yoki parol noto‘g‘ri.", 401);

    await createSession(user);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
