import "server-only";
import { NextResponse } from "next/server";
import { AIError } from "./ai";

export function fail(error: string, status = 400, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error, ...extra }, { status });
}

export async function readJSON(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/** Kutilmagan xatolarni foydalanuvchiga tushunarli xabarga aylantiradi. */
export function handleError(err: unknown) {
  if (err instanceof AIError) return fail(err.message, err.status);
  console.error(err);
  return fail("Serverda kutilmagan xatolik yuz berdi. Birozdan so‘ng qayta urinib ko‘ring.", 500);
}
