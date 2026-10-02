import "server-only";
import type { User } from "./auth";
import { CATALOG, catalogIndexForPrompt } from "./catalog";
import type { ChatMessage } from "./ai";

/* =========================== Turlar =========================== */

export type Dimension = "qiziqish" | "mantiq" | "ijodkorlik" | "texnik" | "ishlash_uslubi" | "motivatsiya";

export interface Question {
  id: number;
  dimension: Dimension;
  question: string;
  options: string[];
  /** Faqat mantiq savollarida: to'g'ri javob indeksi (mijozga yuborilmaydi) */
  correct?: number;
}

export type PublicQuestion = Omit<Question, "correct">;

export interface AssessmentResult {
  profile_type: string;
  summary: string;
  traits: { name: string; score: number }[];
  directions: { id: string; title: string; match: number; why: string }[];
  strengths: string[];
  growth: string[];
  roadmap: { title: string; duration: string; description: string; resources: string[] }[];
  first_week: string[];
  advice: string;
  logic_score?: { correct: number; total: number };
}

const DIMENSIONS: Dimension[] = ["qiziqish", "mantiq", "ijodkorlik", "texnik", "ishlash_uslubi", "motivatsiya"];

export const toPublic = (qs: Question[]): PublicQuestion[] =>
  qs.map(({ correct: _c, ...rest }) => rest);

/* ===================== Foydalanuvchi profili ===================== */

function profileBlock(u: User): string {
  return [
    `Ism: ${u.name}`,
    `Yosh: ${u.age}`,
    `Ta’lim: ${u.education}`,
    `IT bilim darajasi: ${u.skill_level}`,
    `Qiziqishlari: ${u.interests.join(", ")}`,
    `Maqsadi: ${u.goal}`,
    `Haftalik vaqt: ~${u.weekly_hours} soat`,
  ].join("\n");
}

/* ===================== 1) Savollar generatsiyasi ===================== */

export function questionsPrompt(u: User): ChatMessage[] {
  return [
    {
      role: "system",
      content: `Sen HerPath AI — qizlar uchun IT kasbga yo‘naltiruvchi tajribali karyera psixologi va texnik mentorsan.
Vazifa: foydalanuvchi profiliga moslashtirilgan 10 ta diagnostika savolini tuz.

Talablar:
- Til: faqat o‘zbek tili (lotin yozuvi), sodda va samimiy, yoshiga mos. Foydalanuvchiga «siz» deb murojaat qil.
- Aynan 10 ta savol, har birida aynan 4 ta variant. Variantlar qisqa (1 jumla), bir-biridan aniq farqli.
- Savollar taqsimoti:
  * 2 ta "qiziqish" — qaysi turdagi ishlar zavq beradi
  * 2 ta "mantiq" — kichik mantiqiy masala, javobi aniq bitta (masalan, ketma-ketlik, shartli mulohaza, oddiy algoritm). Ular uchun "correct" maydonida to‘g‘ri variant indeksini (0–3) ber. Qiyinligi bilim darajasiga mos.
  * 2 ta "ijodkorlik" — vizual/estetik yoki g‘oya bilan bog‘liq vaziyatlar
  * 2 ta "texnik" — texnologiyaga munosabat, muammo yechish uslubi (bilim imtihoni emas)
  * 1 ta "ishlash_uslubi" — yakka/jamoa, tezkor/chuqur ishlash
  * 1 ta "motivatsiya" — IT dan nimani kutadi
- "Javob noto‘g‘ri" bo‘ladigan savollar faqat "mantiq" turida. Boshqa savollarda barcha variantlar teng qadrli.
- Savollarni foydalanuvchining qiziqishlari va maqsadiga bog‘la, lekin boshqa yo‘nalishlarni ham sinash uchun variantlarni xilma-xil qil.
- Emoji ishlatma.

Faqat JSON qaytar:
{"questions":[{"id":1,"dimension":"qiziqish","question":"...","options":["...","...","...","..."]},{"id":3,"dimension":"mantiq","question":"...","options":["...","...","...","..."],"correct":2}]}`,
    },
    { role: "user", content: `Foydalanuvchi profili:\n${profileBlock(u)}` },
  ];
}

export function validateQuestions(v: unknown): Question[] | null {
  const arr = (v as { questions?: unknown })?.questions;
  if (!Array.isArray(arr)) return null;
  const out: Question[] = [];
  for (const raw of arr) {
    const q = raw as Record<string, unknown>;
    const text = typeof q.question === "string" ? q.question.trim() : "";
    const options = Array.isArray(q.options)
      ? q.options.filter((o): o is string => typeof o === "string" && o.trim().length > 0).map((o) => o.trim())
      : [];
    if (!text || options.length < 3 || options.length > 5) continue;
    const dimension = DIMENSIONS.includes(q.dimension as Dimension) ? (q.dimension as Dimension) : "qiziqish";
    const correct =
      dimension === "mantiq" && Number.isInteger(q.correct) && (q.correct as number) >= 0 && (q.correct as number) < options.length
        ? (q.correct as number)
        : undefined;
    out.push({ id: out.length + 1, dimension, question: text, options, ...(correct !== undefined ? { correct } : {}) });
  }
  return out.length >= 8 ? out.slice(0, 12) : null;
}

/** AI ishlamay qolganda ishlatiladigan zaxira savollar. */
export const FALLBACK_QUESTIONS: Question[] = [
  {
    id: 1,
    dimension: "qiziqish",
    question: "Bo‘sh vaqtingizda qaysi mashg‘ulot sizga ko‘proq zavq beradi?",
    options: [
      "Boshqotirma va mantiqiy jumboqlar yechish",
      "Rasm chizish, dizayn yoki bezatish bilan shug‘ullanish",
      "Raqamlar va qiziqarli statistikalarni o‘rganish",
      "Biror narsani yasash yoki texnikani sozlash",
    ],
  },
  {
    id: 2,
    dimension: "qiziqish",
    question: "Yangi ilovaga kirganingizda birinchi nimaga e’tibor berasiz?",
    options: [
      "Qanchalik tez va qulay ishlashiga",
      "Ranglar, shriftlar va umumiy ko‘rinishiga",
      "Qanday ma’lumotlarni ko‘rsatishi va aniqligiga",
      "Shaxsiy ma’lumotlarim xavfsiz saqlanishiga",
    ],
  },
  {
    id: 3,
    dimension: "mantiq",
    question: "Ketma-ketlikni davom ettiring: 2, 6, 12, 20, 30, ...",
    options: ["40", "42", "44", "36"],
    correct: 1,
  },
  {
    id: 4,
    dimension: "mantiq",
    question:
      "Barcha dasturchilar kod yozadi. Malika kod yozadi. Quyidagilardan qaysi biri albatta to‘g‘ri?",
    options: [
      "Malika — dasturchi",
      "Malika dasturchi bo‘lmasligi ham mumkin",
      "Malika hech qachon dasturchi bo‘lmaydi",
      "Kod yozadiganlarning hammasi dasturchi",
    ],
    correct: 1,
  },
  {
    id: 5,
    dimension: "ijodkorlik",
    question: "Do‘stingiz kichik biznesi uchun sayt so‘radi. Qaysi qism sizni ko‘proq qiziqtiradi?",
    options: [
      "Saytning chiroyli dizayni va brend uslubini o‘ylab topish",
      "Buyurtmalar qanday saqlanishi va ishlashini tuzish",
      "Qaysi mahsulotlar ko‘proq sotilishini tahlil qilish",
      "Saytni hakerlardan himoyalash",
    ],
  },
  {
    id: 6,
    dimension: "ijodkorlik",
    question: "Maktab tadbiri uchun e’lon tayyorlash kerak. Siz nima qilasiz?",
    options: [
      "Ko‘zni quvontiradigan plakat dizaynini chizaman",
      "Ro‘yxatdan o‘tish uchun onlayn forma yarataman",
      "Oldingi tadbirlar statistikasiga qarab eng yaxshi vaqtni tanlayman",
      "Hammasini rejalashtirib, vazifalarni taqsimlayman",
    ],
  },
  {
    id: 7,
    dimension: "texnik",
    question: "Telefoningizda ilova ishlamay qoldi. Odatda nima qilasiz?",
    options: [
      "Sababini o‘zim topishga harakat qilaman — sozlamalar, internet, yangilanish",
      "Internetdan yechim qidiraman va qadamma-qadam bajaraman",
      "Boshqa, qulayroq ilova topaman",
      "Biladigan odamdan yordam so‘rayman",
    ],
  },
  {
    id: 8,
    dimension: "texnik",
    question: "Qaysi biri sizga ko‘proq qiziq tuyuladi?",
    options: [
      "Sun’iy intellekt qanday “o‘ylashi”",
      "Saytlar va ilovalar qanday yaratilishi",
      "Robotlar va qurilmalar qanday boshqarilishi",
      "Ma’lumotlar orqali kelajakni bashorat qilish",
    ],
  },
  {
    id: 9,
    dimension: "ishlash_uslubi",
    question: "Qaysi ish uslubi sizga yaqinroq?",
    options: [
      "Bitta murakkab muammo ustida uzoq va chuqur ishlash",
      "Jamoada g‘oyalar almashib, birga yaratish",
      "Tez natija ko‘rinadigan qisqa vazifalar",
      "Odamlar bilan ko‘p muloqot qiladigan ish",
    ],
  },
  {
    id: 10,
    dimension: "motivatsiya",
    question: "IT sohasidan eng avvalo nimani kutasiz?",
    options: [
      "Yaxshi daromad va barqaror ish",
      "O‘z g‘oyalarimni mahsulotga aylantirish",
      "Dunyoning istalgan joyidan ishlash erkinligi",
      "Jamiyatga foydali yechimlar yaratish",
    ],
  },
];

/* ===================== 2) Javoblarni tahlil qilish ===================== */

export function analysisPrompt(
  u: User,
  questions: Question[],
  answers: number[],
  about: string,
  logic: { correct: number; total: number }
): ChatMessage[] {
  const qa = questions
    .map((q, i) => {
      const a = answers[i];
      const chosen = a >= 0 && a < q.options.length ? q.options[a] : "(javob berilmagan)";
      const mark =
        q.correct !== undefined ? (a === q.correct ? " [TO‘G‘RI]" : ` [NOTO‘G‘RI, to‘g‘risi: ${q.options[q.correct]}]`) : "";
      return `${i + 1}. (${q.dimension}) ${q.question}\n   Javob: ${chosen}${mark}`;
    })
    .join("\n");

  const hoursNote = `Haftasiga ~${u.weekly_hours} soat — yo‘l xaritasi muddatlarini shunga qarab real hisobla.`;

  return [
    {
      role: "system",
      content: `Sen HerPath AI — qizlar uchun IT kasbga yo‘naltiruvchi tajribali karyera psixologi va texnik mentorsan.
Foydalanuvchi profili va diagnostika javoblarini chuqur tahlil qilib, halol va shaxsiy xulosa ber.

Qoidalar:
- Til: o‘zbek (lotin), samimiy, ammo professional, «siz» deb murojaat qil. Emoji ishlatma. Mubolag‘a va bo‘sh maqtovsiz.
- Xulosalar AYNAN berilgan javoblarga asoslansin: "why" va "summary" ichida qaysi javoblar shu xulosaga olib kelganini aniq ayt.
- Mantiq natijasi: ${logic.correct}/${logic.total}. Uni hisobga ol, lekin bitta xato uchun yo‘nalishni rad etma.
- "directions": eng mos 3 ta yo‘nalish, faqat quyidagi katalog id laridan (id aynan shunday yozilsin):
${catalogIndexForPrompt()}
- "match" 40–97 oralig‘ida, kamayish tartibida, bir-biridan farqli bo‘lsin.
- "traits": aynan 5 ta: "Mantiqiy fikrlash", "Ijodkorlik", "Texnik qiziqish", "Tahliliy fikrlash", "Muloqot va jamoa". score 0–100.
- "roadmap": birinchi yo‘nalish bo‘yicha 6–8 bosqich, bilim darajasidan boshlab. ${hoursNote} Har bosqichda 2–3 ta real, bepul resurs nomi (masalan: freeCodeCamp, CS50, MDN, Kaggle Learn, Google UX Design (Coursera, audit), Figma Learn, roadmap.sh, Khan Academy, Stepik, Najot Ta’lim/IT Park bepul kurslari — faqat haqiqatda mavjudlarini yoz).
- "first_week": 5 ta aniq, bajarsa bo‘ladigan vazifa (kuniga qancha vaqt ketishi bilan).
- "strengths" va "growth": har biri 3 tadan, javoblarga asoslangan.
- "advice": 2–3 jumlali shaxsiy maslahat, ismi bilan murojaat qil.

Faqat JSON qaytar:
{"profile_type":"2–4 so‘zli tip nomi","summary":"3–4 jumla","traits":[{"name":"Mantiqiy fikrlash","score":72}],"directions":[{"id":"frontend","title":"...","match":91,"why":"2 jumla"}],"strengths":["..."],"growth":["..."],"roadmap":[{"title":"...","duration":"2–3 hafta","description":"1–2 jumla","resources":["..."]}],"first_week":["..."],"advice":"..."}`,
    },
    {
      role: "user",
      content: `PROFIL:\n${profileBlock(u)}\n\nJAVOBLAR:\n${qa}\n\nO‘ZI HAQIDA (erkin javob): ${about.trim() || "(yozmagan)"}`,
    },
  ];
}

const clamp = (n: unknown, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(Number(n) || 0)));
const strArr = (v: unknown, max: number) =>
  Array.isArray(v) ? v.filter((s): s is string => typeof s === "string" && s.trim() !== "").map((s) => s.trim()).slice(0, max) : [];
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function validateResult(v: unknown): AssessmentResult | null {
  const r = v as Record<string, unknown>;
  if (!r || typeof r !== "object") return null;

  const directions = (Array.isArray(r.directions) ? r.directions : [])
    .map((d: Record<string, unknown>) => {
      const field = CATALOG.find((f) => f.id === str(d.id)) ?? CATALOG.find((f) => f.title === str(d.title));
      if (!field) return null;
      return { id: field.id, title: field.title, match: clamp(d.match, 0, 100), why: str(d.why) };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .filter((d, i, arr) => arr.findIndex((x) => x.id === d.id) === i)
    .sort((a, b) => b.match - a.match)
    .slice(0, 3);

  const roadmap = (Array.isArray(r.roadmap) ? r.roadmap : [])
    .map((s: Record<string, unknown>) => ({
      title: str(s.title),
      duration: str(s.duration),
      description: str(s.description),
      resources: strArr(s.resources, 4),
    }))
    .filter((s) => s.title)
    .slice(0, 10);

  const traits = (Array.isArray(r.traits) ? r.traits : [])
    .map((t: Record<string, unknown>) => ({ name: str(t.name), score: clamp(t.score, 0, 100) }))
    .filter((t) => t.name)
    .slice(0, 6);

  const summary = str(r.summary);
  if (directions.length === 0 || roadmap.length < 3 || !summary) return null;

  return {
    profile_type: str(r.profile_type) || "Izlanuvchan o‘quvchi",
    summary,
    traits,
    directions,
    strengths: strArr(r.strengths, 5),
    growth: strArr(r.growth, 5),
    roadmap,
    first_week: strArr(r.first_week, 7),
    advice: str(r.advice),
  };
}
