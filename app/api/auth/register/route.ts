import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { validateRegister } from "@/lib/profile";
import { fail, handleError, readJSON } from "@/lib/http";

export async function POST(req: Request) {
  try {
    const parsed = validateRegister(await readJSON(req));
    if (!parsed.ok) return fail(parsed.error, 400, { field: parsed.field });
    const d = parsed.data;

    const exists = await queryOne("SELECT 1 FROM users WHERE username = $1", [d.username]);
    if (exists) return fail("Bu username band. Boshqasini tanlang.", 409, { field: "username" });

    const hash = await bcrypt.hash(d.password, 10);
    const rows = await query<{ id: number }>(
      `INSERT INTO users (username, password_hash, name, age, education, skill_level, interests, goal, weekly_hours)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)
       ON CONFLICT (username) DO NOTHING
       RETURNING id`,
      [d.username, hash, d.name, d.age, d.education, d.skill_level, JSON.stringify(d.interests), d.goal, d.weekly_hours]
    );
    if (!rows[0]) return fail("Bu username band. Boshqasini tanlang.", 409, { field: "username" });

    await createSession({ id: rows[0].id, name: d.name, username: d.username });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
