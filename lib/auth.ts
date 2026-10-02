import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { cache } from "react";
import { queryOne } from "./db";

const COOKIE = "hp_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 kun

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET muhit o'zgaruvchisi o'rnatilmagan.");
    }
    return new TextEncoder().encode("herpath-dev-only-secret-change-me");
  }
  return new TextEncoder().encode(secret);
}

export interface User {
  id: number;
  username: string;
  name: string;
  age: number;
  education: string;
  skill_level: string;
  interests: string[];
  goal: string;
  weekly_hours: number;
}

export interface Session {
  uid: number;
  name: string;
  username: string;
}

export async function createSession(user: { id: number; name: string; username: string }) {
  const token = await new SignJWT({ uid: user.id, name: user.name, username: user.username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/** Faqat tokenni tekshiradi (bazaga so'rovsiz) — header kabi tez joylar uchun. */
export const getSession = cache(async (): Promise<Session | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (typeof payload.uid !== "number") return null;
    return { uid: payload.uid, name: String(payload.name ?? ""), username: String(payload.username ?? "") };
  } catch {
    return null;
  }
});

/** Joriy foydalanuvchi (bitta so'rov davomida keshlanadi). */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const uid = (await getSession())?.uid;
  if (!uid) return null;
  const row = await queryOne<User>(
    `SELECT id, username, name, age, education, skill_level, interests, goal, weekly_hours
       FROM users WHERE id = $1`,
    [uid]
  );
  return row;
});

/** Sahifalar uchun: kirmagan bo'lsa login sahifasiga yuboradi. */
export async function requireUser(next = "/dashboard"): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}
