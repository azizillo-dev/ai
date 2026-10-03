import "server-only";
import { createHash } from "node:crypto";
import type { ChatMessage } from "./ai";
import type { Field } from "./catalog";
import { CATALOG } from "./catalog";

/* =========================== Turlar =========================== */

export type Visual =
  | { type: "points"; items: string[] }
  | { type: "steps"; items: string[] }
  | { type: "analogy"; life: { label: string; text: string }; tech: { label: string; text: string } }
  | { type: "code"; language: string; code: string; caption?: string }
  | { type: "keyword"; word: string; meaning: string };

export interface Scene {
  title: string;
  narration: string;
  visual: Visual;
}

export interface QuizQ {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface Lesson {
  title: string;
  scenes: Scene[];
  quiz: QuizQ[];
}

/* =========================== Mavzular =========================== */

export const stripStage = (s: string) => s.replace(/^\d+-bosqich:\s*/i, "").trim();

/** Katalogdagi kasb mavzulari (what_to_learn) */
export function fieldTopics(field: Field): string[] {
  return field.what_to_learn.map(stripStage).filter(Boolean);
}

export function lessonKey(fieldId: string, topic: string): string {
  return createHash("sha1").update(`${fieldId}|${topic.trim().toLowerCase()}`).digest("hex").slice(0, 24);
}

/** Mavzu ruxsat etilganmi: katalogda yoki foydalanuvchining yo'l xaritasida bo'lishi kerak */
export function isAllowedTopic(fieldId: string, topic: string, roadmapTitles: string[]): boolean {
  const field = CATALOG.find((f) => f.id === fieldId);
  if (!field) return false;
  const t = topic.trim().toLowerCase();
  return fieldTopics(field).some((x) => x.toLowerCase() === t) || roadmapTitles.some((x) => x.trim().toLowerCase() === t);
}

/* =========================== Prompt =========================== */

export function lessonPrompt(field: Field, topic: string): ChatMessage[] {
  return [
    {
      role: "system",
      content: `Sen HerPath AI uchun qisqa animatsion video-dars ssenariysini yozuvchi tajribali o‘qituvchisan.
Tomoshabin: IT ni endi o‘rganayotgan maktab o‘quvchisi yoki talaba qiz. Har bir sahna ekranda vizual bilan ko‘rsatiladi, "narration" esa ovoz bilan o‘qiladi.

Qoidalar:
- Til: o‘zbek (lotin), jonli va samimiy, «siz» deb murojaat qil. Emoji ishlatma.
- 5–7 ta sahna. Birinchisi — mavzu nima uchun kerakligi (qiziqarli hayotiy vaziyat bilan). Oxirgisi — xulosa va birinchi amaliy qadam.
- Har bir "narration": 2–3 qisqa jumla (40 so‘zdan oshmasin), markdown va kodsiz, ovoz chiqarib o‘qishga qulay.
- Kamida bitta "analogy" (kundalik hayot ↔ texnologiya) va mavzuga mos bo‘lsa bitta "code" sahnasi bo‘lsin.
- "visual" turlari:
  {"type":"points","items":["3–4 ta qisqa band (6 so‘zgacha)"]}
  {"type":"steps","items":["3–5 ta ketma-ket qadam (5 so‘zgacha)"]}
  {"type":"analogy","life":{"label":"Hayotda","text":"..."},"tech":{"label":"Dasturlashda","text":"..."}}
  {"type":"code","language":"html|css|javascript|python|sql|bash|...","code":"8 qatordan oshmaydigan, izohli kod","caption":"bir jumla"}
  {"type":"keyword","word":"atama","meaning":"bir jumlali sodda ta’rif"}
- "quiz": aynan 3 ta savol, har birida 4 variant, "correct" 0–3, "explanation" — bitta jumla. Savollar darsda aytilganlarga asoslansin.
- Faktlar to‘g‘ri bo‘lsin; ishonchsiz raqam va sanalarni yozma.

Faqat JSON qaytar:
{"title":"...","scenes":[{"title":"...","narration":"...","visual":{...}}],"quiz":[{"question":"...","options":["...","...","...","..."],"correct":1,"explanation":"..."}]}`,
    },
    {
      role: "user",
      content: `Yo‘nalish: ${field.title}\nMavzu: ${topic}\nYo‘nalish haqida: ${field.short_desc}`,
    },
  ];
}

/* =========================== Tekshiruv =========================== */

const s = (v: unknown, max = 400) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const arr = (v: unknown, max: number, len = 80) =>
  Array.isArray(v) ? v.map((x) => s(x, len)).filter(Boolean).slice(0, max) : [];

function validateVisual(v: unknown): Visual | null {
  const o = (v ?? {}) as Record<string, unknown>;
  switch (o.type) {
    case "points":
    case "steps": {
      const items = arr(o.items, o.type === "steps" ? 5 : 4);
      return items.length >= 2 ? { type: o.type, items } : null;
    }
    case "analogy": {
      const life = (o.life ?? {}) as Record<string, unknown>;
      const tech = (o.tech ?? {}) as Record<string, unknown>;
      const lt = s(life.text, 220);
      const tt = s(tech.text, 220);
      return lt && tt
        ? { type: "analogy", life: { label: s(life.label, 30) || "Hayotda", text: lt }, tech: { label: s(tech.label, 30) || "Dasturlashda", text: tt } }
        : null;
    }
    case "code": {
      const code = s(o.code, 700)
        .split("\n")
        .slice(0, 12)
        .join("\n");
      return code ? { type: "code", language: s(o.language, 20) || "code", code, caption: s(o.caption, 160) || undefined } : null;
    }
    case "keyword": {
      const word = s(o.word, 40);
      const meaning = s(o.meaning, 220);
      return word && meaning ? { type: "keyword", word, meaning } : null;
    }
    default:
      return null;
  }
}

export function validateLesson(v: unknown): Lesson | null {
  const o = (v ?? {}) as Record<string, unknown>;
  const scenes: Scene[] = (Array.isArray(o.scenes) ? o.scenes : [])
    .map((x: Record<string, unknown>) => {
      const narration = s(x.narration, 420);
      const title = s(x.title, 90);
      const visual = validateVisual(x.visual) ?? (title ? { type: "keyword" as const, word: title, meaning: narration.slice(0, 200) } : null);
      return title && narration && visual ? { title, narration, visual } : null;
    })
    .filter((x): x is Scene => x !== null)
    .slice(0, 8);

  const quiz: QuizQ[] = (Array.isArray(o.quiz) ? o.quiz : [])
    .map((x: Record<string, unknown>) => {
      const options = arr(x.options, 4, 140);
      const correct = Number(x.correct);
      const question = s(x.question, 240);
      return question && options.length === 4 && Number.isInteger(correct) && correct >= 0 && correct < 4
        ? { question, options, correct, explanation: s(x.explanation, 260) }
        : null;
    })
    .filter((x): x is QuizQ => x !== null)
    .slice(0, 3);

  const title = s(o.title, 120);
  if (!title || scenes.length < 4 || quiz.length < 2) return null;
  return { title, scenes, quiz };
}
