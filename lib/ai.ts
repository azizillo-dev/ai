import "server-only";
import { env } from "./env";

/**
 * AI provayderlar qatlami. Barchasi OpenAI-mos /chat/completions API beradi:
 *  - Google Gemini (bepul, o'zbek tilini yaxshi tushunadi)
 *  - Groq (bepul, juda tez)
 *  - DeepSeek (pullik, lekin juda arzon; ixtiyoriy)
 * Qaysi kalitlar qo'yilgan bo'lsa, o'shalar ishlatiladi. Biri limitga yetsa yoki ishlamasa,
 * avtomatik keyingisiga o'tiladi.
 */

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

type ProviderName = "gemini" | "groq" | "deepseek";

interface Provider {
  name: ProviderName;
  url: string;
  key: string;
  model: string;
}

interface Options {
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  /** Barcha urinishlar uchun umumiy muddat (Date.now() bo'yicha ms) */
  deadline?: number;
}

export class AIError extends Error {
  constructor(message: string, public status = 503) {
    super(message);
  }
}


function providers(): Provider[] {
  const list: Provider[] = [];
  if (env("GEMINI_API_KEY")) {
    // Gemini ba'zan "high demand" (503) qaytaradi — shu kalit bilan bir nechta modelni navbat bilan sinaymiz.
    // GEMINI_MODEL vergul bilan ajratilgan ro'yxat bo'lishi mumkin.
    const models = (process.env.GEMINI_MODEL || "gemini-flash-latest,gemini-flash-lite-latest,gemini-3.5-flash,gemini-3.8-flash")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    for (const model of models) {
      list.push({
        name: "gemini",
        url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        key: env("GEMINI_API_KEY"),
        model,
      });
    }
  }
  if (env("GROQ_API_KEY")) {
    list.push({
      name: "groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: env("GROQ_API_KEY"),
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    });
  }
  if (env("DEEPSEEK_API_KEY")) {
    list.push({
      name: "deepseek",
      url: "https://api.deepseek.com/chat/completions",
      key: env("DEEPSEEK_API_KEY"),
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
    });
  }
  if (list.length === 0) {
    throw new AIError("AI kaliti sozlanmagan. GEMINI_API_KEY, GROQ_API_KEY yoki DEEPSEEK_API_KEY ni qo‘shing.", 500);
  }
  // AI_PRIMARY ko'rsatilgan bo'lsa — o'sha provayder birinchi ishlatiladi (sort barqaror)
  const primary = process.env.AI_PRIMARY as ProviderName | undefined;
  if (primary) list.sort((a, b) => Number(b.name === primary) - Number(a.name === primary));

  // Yaqinda xato bergan provayderlarni oxiriga surish (hammasi "dam olayotgan" bo'lsa ham urinib ko'ramiz)
  const now = Date.now();
  const resting = (p: Provider) => (cooldown.get(cooldownKey(p)) ?? 0) > now;
  return [...list.filter((p) => !resting(p)), ...list.filter(resting)];
}

/** Xato bergan provayder/modelni vaqtincha chetga qo'yish: kalit/balans xatosi — 10 daqiqa, band — 30 soniya. */
const cooldown = new Map<string, number>();
const cooldownKey = (p: Provider) => `${p.name}:${p.model}`;
function rest(p: Provider, status: number) {
  const ms = status === 401 || status === 402 || status === 403 ? 10 * 60_000 : status === 429 || status >= 500 ? 30_000 : 0;
  if (ms) cooldown.set(cooldownKey(p), Date.now() + ms);
}

function buildBody(p: Provider, messages: ChatMessage[], opts: Options, stream: boolean, extras: boolean) {
  const wanted = opts.maxTokens ?? 2048;
  const body: Record<string, unknown> = {
    model: p.model,
    messages,
    temperature: opts.temperature ?? 0.7,
    // Groq bepul tarifida so'rov (kirish + max_tokens) daqiqalik 8K token limitiga sig'ishi kerak
    max_tokens: p.name === "groq" ? Math.min(wanted, 4000) : wanted,
    stream,
  };
  if (extras) {
    // Fikrlash bosqichini qisqartirish — javob tezroq keladi
    body.reasoning_effort = "low";
    if (opts.json) body.response_format = { type: "json_object" };
  }
  return body;
}

function timeoutFor(opts: Options): number {
  const base = opts.timeoutMs ?? 50_000;
  return opts.deadline ? Math.max(1_000, Math.min(base, opts.deadline - Date.now())) : base;
}

/** Bitta provayderga so'rov. 400 bo'lsa (qo'shimcha parametr qo'llanmasa) — ularsiz qayta urinadi. */
async function callProvider(p: Provider, messages: ChatMessage[], opts: Options, stream: boolean): Promise<Response> {
  const send = async (extras: boolean) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error("timeout")), timeoutFor(opts));
    try {
      const res = await fetch(p.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.key}` },
        body: JSON.stringify(buildBody(p, messages, opts, stream, extras)),
        signal: controller.signal,
      });
      // Streamingda timeout faqat birinchi javobgacha — uzun javob o'rtada uzilmasin
      if (stream) clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  };

  let res = await send(true);
  if (res.status === 400) {
    await res.body?.cancel();
    res = await send(false);
  }
  return res;
}

async function withFallback(
  messages: ChatMessage[],
  opts: Options,
  stream: boolean,
  skip: Set<string> = new Set()
): Promise<{ res: Response; provider: Provider }> {
  const errors: string[] = [];
  for (const p of providers()) {
    if (skip.has(cooldownKey(p))) continue;
    if (opts.deadline && opts.deadline - Date.now() < 5_000) {
      errors.push(`${p.name}: vaqt tugadi`);
      break;
    }
    try {
      const res = await callProvider(p, messages, opts, stream);
      if (res.ok) {
        cooldown.delete(cooldownKey(p));
        return { res, provider: p };
      }
      rest(p, res.status);
      const text = (await res.text()).replace(/\s+/g, " ").slice(0, 200);
      errors.push(`${p.name}/${p.model}: ${res.status} ${text}`);
    } catch (err) {
      rest(p, 503);
      errors.push(`${p.name}/${p.model}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  console.error("[ai] barcha provayderlar xato berdi:", errors.join(" | "));
  const limited = errors.some((e) => /: (429|503) /.test(e));
  throw new AIError(
    limited
      ? "AI hozir juda band. Bir daqiqadan so‘ng qayta urinib ko‘ring."
      : "AI xizmatiga ulanib bo‘lmadi. Birozdan so‘ng qayta urinib ko‘ring."
  );
}

/** Oddiy (to'liq) javob. */
export async function complete(messages: ChatMessage[], opts: Options = {}): Promise<string> {
  const { res } = await withFallback(messages, opts, false);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new AIError("AI bo‘sh javob qaytardi. Qayta urinib ko‘ring.");
  return content;
}

/** Matndan birinchi JSON obyektni ajratib oladi (```json bloklari ichida bo'lsa ham). */
export function extractJSON(text: string): unknown {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error("JSON topilmadi");
  }
}

/**
 * JSON javob + tekshiruv. Model noto'g'ri format qaytarsa, bir marta qayta so'raydi.
 * `validate` noto'g'ri bo'lsa null qaytarishi kerak.
 */
export async function completeJSON<T>(
  messages: ChatMessage[],
  validate: (v: unknown) => T | null,
  opts: Options = {}
): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0 && opts.deadline && opts.deadline - Date.now() < 15_000) break;
    const text = await complete(messages, { ...opts, json: true });
    try {
      const value = validate(extractJSON(text));
      if (value) return value;
    } catch {
      /* qayta urinish */
    }
    console.warn("[ai] noto'g'ri JSON, qayta so'ralmoqda");
  }
  throw new AIError("AI javobini o‘qib bo‘lmadi. Qayta urinib ko‘ring.");
}

/**
 * Oqimli (streaming) javob: faqat matn bo'laklarini qaytaruvchi ReadableStream.
 * - Birinchi ulanish muvaffaqiyatsiz bo'lsa, AIError tashlanadi (route 503 JSON qaytaradi).
 * - Javob o'rtada uzilsa (Gemini "high demand" xatosini oqim ichida yuboradi yoki ulanish
 *   jim qoladi), keyingi provayder/model to'xtagan joydan davom ettiradi.
 * - `onDone` — to'liq matn bilan oxirida chaqiriladi (bazaga saqlash uchun).
 */
const IDLE_MS = 30_000;
const CONTINUE_PROMPT =
  "Oldingi javobing texnik sabab bilan uzilib qoldi. Aynan to‘xtagan joyingdan davom ettir: takrorlama, kirish so‘zi yozma.";

export async function stream(
  messages: ChatMessage[],
  opts: Options = {},
  onDone?: (full: string) => Promise<void> | void
): Promise<ReadableStream<Uint8Array>> {
  const used = new Set<string>();
  const first = await withFallback(messages, opts, true);
  used.add(cooldownKey(first.provider));

  const encoder = new TextEncoder();
  let full = "";
  let current: ReadableStreamDefaultReader<Uint8Array> | null = null;

  /** Bitta upstream oqimini o'qiydi. true — oxirigacha to'g'ri yetib keldi. */
  async function pump(res: Response, emit: (piece: string) => void): Promise<boolean> {
    if (!res.body) return false;
    const reader = res.body.getReader();
    current = reader;
    const decoder = new TextDecoder();
    let buffer = "";
    let finished = false;
    let failed = false;

    const handleLine = (line: string) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(":")) return;
      if (!trimmed.startsWith("data:")) {
        // Gemini oqim o'rtasida xatoni oddiy JSON ko'rinishida yuboradi
        if (/"error"|"code"\s*:\s*5\d\d|UNAVAILABLE/.test(trimmed)) failed = true;
        return;
      }
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") {
        finished = true;
        return;
      }
      try {
        const json = JSON.parse(payload) as {
          error?: unknown;
          choices?: { delta?: { content?: string }; finish_reason?: string | null }[];
        };
        if (json.error) failed = true;
        const choice = json.choices?.[0];
        const piece = choice?.delta?.content;
        if (piece) emit(piece);
        if (choice?.finish_reason) finished = true;
      } catch {
        /* to'liq bo'lmagan qator — e'tiborsiz */
      }
    };

    try {
      for (;;) {
        let timer: ReturnType<typeof setTimeout> | undefined;
        const idle = new Promise<"idle">((r) => (timer = setTimeout(() => r("idle"), IDLE_MS)));
        const result = await Promise.race([reader.read(), idle]);
        clearTimeout(timer);
        if (result === "idle") {
          reader.cancel().catch(() => {});
          return false;
        }
        if (result.done) break;
        buffer += decoder.decode(result.value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        lines.forEach(handleLine);
      }
      handleLine(buffer);
    } catch {
      return false;
    } finally {
      current = null;
    }
    return finished && !failed;
  }

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (piece: string) => {
        full += piece;
        controller.enqueue(encoder.encode(piece));
      };
      let res: Response | null = first.res;
      let provider = first.provider;

      try {
        for (let attempt = 0; res && attempt < 4; attempt++) {
          const ok = await pump(res, emit);
          if (ok) break;
          rest(provider, 503);
          console.warn(`[ai] oqim uzildi (${provider.name}/${provider.model}), davom ettirilmoqda`);

          // Keyingi provayder: bo'sh bo'lsa — boshidan, aks holda — to'xtagan joydan
          const nextMessages: ChatMessage[] = full.trim()
            ? [...messages, { role: "assistant", content: full }, { role: "user", content: CONTINUE_PROMPT }]
            : messages;
          try {
            const next = await withFallback(nextMessages, opts, true, used);
            used.add(cooldownKey(next.provider));
            res = next.res;
            provider = next.provider;
            if (full.trim() && !/\s$/.test(full)) emit(" ");
          } catch {
            res = null;
            emit(
              full.trim()
                ? "\n\n_(Javob uzilib qoldi — AI hozir band. Birozdan so‘ng qayta so‘rang.)_"
                : "AI hozir juda band. Bir daqiqadan so‘ng qayta urinib ko‘ring."
            );
            full = full.trim() ? full : "";
          }
        }
        if (onDone && full.trim()) await onDone(full.trim());
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      (current as ReadableStreamDefaultReader<Uint8Array> | null)?.cancel().catch(() => {});
    },
  });
}
