import "server-only";
import { query, queryOne } from "./db";

/** Bepul AI kvotasini himoya qilish: foydalanuvchining kunlik limiti. */
export const LIMITS = {
  stt: 120, // ovozli savollar
  tts: 200, // keshda yo'q ovozlar
  lesson: 15, // yangi dars generatsiyasi
  live: 40, // real vaqtdagi ovozli suhbat sessiyalari
} as const;

export type UsageKind = keyof typeof LIMITS;

/** Limitdan oshmagan bo'lsa — yozib qo'yadi va true qaytaradi. */
export async function takeQuota(userId: number, kind: UsageKind): Promise<boolean> {
  const row = await queryOne<{ n: number }>(
    "SELECT COUNT(*)::int AS n FROM usage_log WHERE user_id = $1 AND kind = $2 AND created_at > now() - interval '24 hours'",
    [userId, kind]
  );
  if ((row?.n ?? 0) >= LIMITS[kind]) return false;
  await query("INSERT INTO usage_log (user_id, kind) VALUES ($1, $2)", [userId, kind]);
  return true;
}
