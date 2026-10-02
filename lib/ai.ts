import "server-only";

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
  if (process.env.GEMINI_API_KEY) {
    list.push({
      name: "gemini",
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      key: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || "gemini-flash-latest",
    });
  }
  if (process.env.GROQ_API_KEY) {
    list.push({
      name: "groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    });
  }
  if (process.env.DEEPSEEK_API_KEY) {
    list.push({
      name: "deepseek",
      url: "https://api.deepseek.com/chat/completions",
      key: process.env.DEEPSEEK_API_KEY,
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
    });
  }
  if (list.length === 0) {
    throw new AIError("AI kaliti sozlanmagan. GEMINI_API_KEY, GROQ_API_KEY yoki DEEPSEEK_API_KEY ni qo‘shing.", 500);
  }
  // AI_PRIMARY ko'rsatilgan bo'lsa — o'sha provayder birinchi ishlatiladi
  const primary = process.env.AI_PRIMARY as ProviderName | undefined;
  const idx = list.findIndex((p) => p.name === primary);
  if (idx > 0) list.unshift(...list.splice(idx, 1));
  return list;
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
  stream: boolean
): Promise<{ res: Response; provider: Provider }> {
  const errors: string[] = [];
  for (const p of providers()) {
    if (opts.deadline && opts.deadline - Date.now() < 5_000) {
      errors.push(`${p.name}: vaqt tugadi`);
      break;
    }
    try {
      const res = await callProvider(p, messages, opts, stream);
      if (res.ok) return { res, provider: p };
      const text = (await res.text()).slice(0, 300);
      errors.push(`${p.name}: ${res.status} ${text}`);
    } catch (err) {
      errors.push(`${p.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  console.error("[ai] barcha provayderlar xato berdi:", errors.join(" | "));
  const limited = errors.some((e) => / 429 /.test(e));
  throw new AIError(
    limited
      ? "AI hozir juda band (limit). Bir daqiqadan so‘ng qayta urinib ko‘ring."
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
 * `onDone` — to'liq matn bilan oxirida chaqiriladi (bazaga saqlash uchun).
 */
export async function stream(
  messages: ChatMessage[],
  opts: Options = {},
  onDone?: (full: string) => Promise<void> | void
): Promise<ReadableStream<Uint8Array>> {
  const { res } = await withFallback(messages, opts, true);
  if (!res.body) throw new AIError("AI javob oqimi bo‘sh.");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  let full = "";

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          if (onDone && full.trim()) await onDone(full.trim());
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload) as { choices?: { delta?: { content?: string } }[] };
            const piece = json.choices?.[0]?.delta?.content;
            if (piece) {
              full += piece;
              controller.enqueue(encoder.encode(piece));
            }
          } catch {
            /* to'liq bo'lmagan qator — e'tiborsiz */
          }
        }
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}
