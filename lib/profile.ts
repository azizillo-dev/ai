/** Ro'yxatdan o'tish formasi variantlari — client va server bir xil manbadan foydalanadi. */

export const EDUCATION = [
  "Maktab o‘quvchisi",
  "Litsey yoki kollej talabasi",
  "Universitet talabasi",
  "Bitiruvchi / mustaqil o‘rganuvchi",
] as const;

export const SKILL_LEVELS = [
  "Noldan boshlayapman",
  "Boshlang‘ich (kompyuter savodxonligi, HTML/CSS)",
  "O‘rta (biror dasturlash tili asoslarini bilaman)",
  "Tajribali (loyihalar qilganman)",
] as const;

export const INTERESTS = [
  "Dasturlash",
  "Sun’iy intellekt",
  "UI/UX dizayn",
  "Ma’lumotlar tahlili",
  "Kiberxavfsizlik",
  "Mobil ilovalar",
  "Robototexnika",
  "O‘yinlar yaratish",
] as const;

export const GOALS = [
  "IT kompaniyada ishga kirish",
  "Masofaviy (remote) yoki frilans ishlash",
  "O‘z startapimni yaratish",
  "Xalqaro grant yutish va xorijda o‘qish",
  "Hali aniq emas — yo‘nalishimni topmoqchiman",
] as const;

export const WEEKLY_HOURS = [
  { value: 4, label: "3–5 soat (kuniga ~40 daqiqa)" },
  { value: 10, label: "8–12 soat (kuniga ~1.5 soat)" },
  { value: 20, label: "20+ soat (intensiv)" },
] as const;

export const USERNAME_RE = /^[a-z0-9_.]{3,24}$/;

export interface RegisterInput {
  name: string;
  username: string;
  password: string;
  age: number;
  education: string;
  skill_level: string;
  interests: string[];
  goal: string;
  weekly_hours: number;
}

/** Xato bo'lsa — maydon nomi va xabar; to'g'ri bo'lsa — tozalangan qiymat. */
export function validateRegister(
  body: unknown
): { ok: true; data: RegisterInput } | { ok: false; field: string; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const name = str(b.name);
  if (name.length < 2 || name.length > 60) return { ok: false, field: "name", error: "Ismingizni kiriting (2–60 belgi)." };

  const username = str(b.username).toLowerCase();
  if (!USERNAME_RE.test(username))
    return { ok: false, field: "username", error: "Username 3–24 belgi: lotin harflari, raqam, _ yoki . bo‘lishi mumkin." };

  const password = typeof b.password === "string" ? b.password : "";
  if (password.length < 6 || password.length > 100)
    return { ok: false, field: "password", error: "Parol kamida 6 belgidan iborat bo‘lsin." };

  const age = Number(b.age);
  if (!Number.isInteger(age) || age < 10 || age > 70) return { ok: false, field: "age", error: "Yoshingizni to‘g‘ri kiriting (10–70)." };

  const education = str(b.education);
  if (!(EDUCATION as readonly string[]).includes(education)) return { ok: false, field: "education", error: "Ta’lim darajasini tanlang." };

  const skill_level = str(b.skill_level);
  if (!(SKILL_LEVELS as readonly string[]).includes(skill_level)) return { ok: false, field: "skill_level", error: "Bilim darajasini tanlang." };

  const interests = Array.isArray(b.interests)
    ? b.interests.filter((i): i is string => typeof i === "string" && (INTERESTS as readonly string[]).includes(i))
    : [];
  if (interests.length === 0) return { ok: false, field: "interests", error: "Kamida bitta qiziqishni tanlang." };

  const goal = str(b.goal);
  if (!(GOALS as readonly string[]).includes(goal)) return { ok: false, field: "goal", error: "Maqsadingizni tanlang." };

  const weekly_hours = Number(b.weekly_hours);
  if (!WEEKLY_HOURS.some((h) => h.value === weekly_hours)) return { ok: false, field: "weekly_hours", error: "Haftalik vaqtni tanlang." };

  return { ok: true, data: { name, username, password, age, education, skill_level, interests: [...new Set(interests)], goal, weekly_hours } };
}
