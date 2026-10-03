import "server-only";

/**
 * Ma'lumotlar bazasi qatlami.
 * - DATABASE_URL bo'lsa: Neon Postgres (Vercel uchun, serverless HTTP drayver).
 * - Bo'lmasa (faqat lokal): PGlite — .data/ papkasida saqlanadigan ichki Postgres.
 */

type Row = Record<string, unknown>;
type QueryFn = (text: string, params?: unknown[]) => Promise<Row[]>;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name          TEXT NOT NULL,
    age           INTEGER NOT NULL,
    education     TEXT NOT NULL,
    skill_level   TEXT NOT NULL,
    interests     JSONB NOT NULL DEFAULT '[]'::jsonb,
    goal          TEXT NOT NULL,
    weekly_hours  INTEGER NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS assessments (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    questions   JSONB NOT NULL,
    answers     JSONB,
    result      JSONB,
    source      TEXT NOT NULL DEFAULT 'ai',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at TIMESTAMPTZ
  )`,
  `CREATE INDEX IF NOT EXISTS assessments_user_idx ON assessments (user_id, id DESC)`,
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS chat_messages_user_idx ON chat_messages (user_id, id DESC)`,
  `CREATE TABLE IF NOT EXISTS tts_cache (
    key        TEXT PRIMARY KEY,
    audio      TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS lessons (
    key        TEXT PRIMARY KEY,
    field_id   TEXT NOT NULL,
    topic      TEXT NOT NULL,
    data       JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS lesson_progress (
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_key   TEXT NOT NULL,
    score        INTEGER NOT NULL DEFAULT 0,
    total        INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, lesson_key)
  )`,
  `CREATE TABLE IF NOT EXISTS usage_log (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS usage_log_idx ON usage_log (user_id, kind, created_at DESC)`,
];

const g = globalThis as unknown as { __hpDb?: Promise<QueryFn> };

async function connect(): Promise<QueryFn> {
  let run: QueryFn;
  const url = (process.env.DATABASE_URL || process.env.POSTGRES_URL || "").trim();

  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    run = async (text, params = []) => (await sql.query(text, params)) as Row[];
  } else {
    if (process.env.VERCEL) {
      throw new Error(
        "DATABASE_URL topilmadi. Vercel → Storage bo'limidan Neon Postgres bazasini ulang."
      );
    }
    const { mkdir } = await import("node:fs/promises");
    await mkdir("./.data", { recursive: true });
    const { PGlite } = await import("@electric-sql/pglite");
    const db = new PGlite("./.data/pglite");
    run = async (text, params = []) => (await db.query<Row>(text, params)).rows;
  }

  for (const stmt of SCHEMA) await run(stmt);
  return run;
}

function getDb(): Promise<QueryFn> {
  if (!g.__hpDb) {
    g.__hpDb = connect().catch((err) => {
      g.__hpDb = undefined; // keyingi so'rovda qayta urinish
      throw err;
    });
  }
  return g.__hpDb;
}

export async function query<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  const run = await getDb();
  return (await run(text, params)) as T[];
}

export async function queryOne<T = Row>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
