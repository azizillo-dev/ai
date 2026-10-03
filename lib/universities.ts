/**
 * O'zbekistondagi IT bo'yicha universitetlar.
 * Ma'lumotlar 2026-yil oktabr holatiga rasmiy saytlar va uzbmb.uz e'lonlaridan olingan.
 * Qabul qoidalari, narxlar va muddatlar har yili o'zgaradi — sahifada buni aniq ko'rsatamiz.
 */

/** IT yo'nalish guruhlari — katalogdagi kasblarni universitet dasturlariga bog'lash uchun */
export type Track = "software" | "ai" | "security" | "computer" | "telecom" | "data";

export const TRACK_LABELS: Record<Track, string> = {
  software: "Dasturiy injiniring",
  ai: "Sun’iy intellekt",
  security: "Kiberxavfsizlik",
  computer: "Kompyuter injiniringi",
  telecom: "Telekommunikatsiya",
  data: "Ma’lumotlar va axborot tizimlari",
};

export type UniType = "Davlat" | "Xalqaro hamkorlik" | "Xususiy";

export interface University {
  id: string;
  name: string;
  short: string;
  type: UniType;
  cities: string[];
  languages: string[];
  programs: { name: string; tracks: Track[] }[];
  /** Qanday kiriladi — qisqa va aniq */
  admission: string[];
  /** Grant yoki chegirma imkoniyati */
  funding: string;
  /** Faqat rasmiy manbada tasdiqlangan narx; aks holda undefined */
  fee?: string;
  website: string;
}

export const UNIVERSITIES: University[] = [
  {
    id: "tatu",
    name: "Muhammad al-Xorazmiy nomidagi Toshkent axborot texnologiyalari universiteti",
    short: "TATU",
    type: "Davlat",
    cities: ["Toshkent", "Samarqand", "Farg‘ona", "Urganch", "Qarshi", "Nukus"],
    languages: ["O‘zbek", "Rus"],
    programs: [
      { name: "Dasturiy injiniring", tracks: ["software"] },
      { name: "Kompyuter injiniringi", tracks: ["computer", "software"] },
      { name: "Sun’iy intellekt", tracks: ["ai", "data"] },
      { name: "Axborot xavfsizligi", tracks: ["security"] },
      { name: "Kiberxavfsizlik injiniringi", tracks: ["security"] },
      { name: "Telekommunikatsiya texnologiyalari", tracks: ["telecom", "computer"] },
    ],
    admission: [
      "Davlat test sinovi (DTM) orqali: my.uzbmb.uz da ro‘yxatdan o‘tiladi",
      "Mutaxassislik fanlari: matematika va fizika",
      "Filiallarda ham shu yo‘nalishlar bor — o‘z viloyatingizda o‘qish mumkin",
    ],
    funding: "Davlat granti va to‘lov-kontrakt",
    website: "https://tuit.uz",
  },
  {
    id: "ozmu",
    name: "Mirzo Ulug‘bek nomidagi O‘zbekiston Milliy universiteti — Amaliy matematika va intellektual texnologiyalar fakulteti",
    short: "O‘zMU",
    type: "Davlat",
    cities: ["Toshkent"],
    languages: ["O‘zbek", "Rus"],
    programs: [
      { name: "Amaliy matematika", tracks: ["data", "ai"] },
      { name: "Sun’iy intellekt (ta’lim shakllari rasmiy saytda)", tracks: ["ai", "data"] },
    ],
    admission: ["Davlat test sinovi (DTM) orqali: my.uzbmb.uz", "Matematikaga kuchli bo‘lganlar uchun yaxshi tanlov"],
    funding: "Davlat granti va to‘lov-kontrakt",
    website: "https://nuu.uz",
  },
  {
    id: "newuu",
    name: "Yangi O‘zbekiston universiteti (New Uzbekistan University)",
    short: "NewUU",
    type: "Davlat",
    cities: ["Toshkent"],
    languages: ["Ingliz"],
    programs: [
      { name: "Software Engineering", tracks: ["software"] },
      { name: "Cyber Security", tracks: ["security"] },
      { name: "AI and Robotics", tracks: ["ai", "computer"] },
    ],
    admission: [
      "Universitetning o‘z tanlov jarayoni (har bir dastur uchun alohida mezon)",
      "Ingliz tili: IELTS 5.5 yoki TOEFL iBT 46",
      "Qabul odatda yanvar–iyul oylarida",
    ],
    funding: "Grant va stipendiyalar — rasmiy saytda",
    website: "https://newuu.uz",
  },
  {
    id: "inha",
    name: "Toshkentdagi Inha universiteti (Janubiy Koreya)",
    short: "Inha",
    type: "Xalqaro hamkorlik",
    cities: ["Toshkent"],
    languages: ["Ingliz"],
    programs: [
      { name: "Computer Science & Software Engineering", tracks: ["software", "ai", "data"] },
      { name: "Information & Communication Engineering", tracks: ["computer", "telecom"] },
    ],
    admission: [
      "O‘z kirish imtihoni: matematika (70 ball) + fizika (30 ball)",
      "Ingliz tili: IELTS 5.0 yoki TOEFL iBT 50",
      "2026-yilda imtihon uch marta o‘tkazildi: aprel, iyun, avgust",
    ],
    funding: "To‘lov-kontrakt",
    fee: "40 400 000 so‘m / yil (2026–2027)",
    website: "https://inha.uz",
  },
  {
    id: "ttpu",
    name: "Toshkentdagi Turin politexnika universiteti (Italiya)",
    short: "TTPU",
    type: "Xalqaro hamkorlik",
    cities: ["Toshkent"],
    languages: ["Ingliz"],
    programs: [
      { name: "Computer Engineering", tracks: ["computer", "software"] },
      { name: "Software Engineering", tracks: ["software"] },
    ],
    admission: [
      "O‘z kirish imtihoni — ro‘yxatdan o‘tish: qabul.turin.uz",
      "IELTS 5.0 bo‘lsa, 1-kursga imtihonsiz qabul qilinadi",
    ],
    funding: "To‘lov-kontrakt",
    website: "https://turin.uz",
  },
  {
    id: "itpu",
    name: "IT Park University (EPAM va IT Park hamkorligida)",
    short: "ITPU",
    type: "Xususiy",
    cities: ["Toshkent"],
    languages: ["Ingliz"],
    programs: [
      { name: "Software Engineering", tracks: ["software"] },
      { name: "Cybersecurity", tracks: ["security"] },
    ],
    admission: [
      "Kirish imtihoni: ingliz tili va matematika (onlayn yoki joyida)",
      "IELTS 5.0+ bo‘lsa, ingliz tili imtihonidan ozod",
      "Ro‘yxatdan o‘tish: my.itpu.uz",
    ],
    funding: "To‘lov-kontrakt; amaliyotga yo‘naltirilgan ta’lim",
    fee: "25 400 000 so‘m / yil (2026–2027)",
    website: "https://itpu.uz",
  },
  {
    id: "cau",
    name: "Central Asian University",
    short: "CAU",
    type: "Xususiy",
    cities: ["Toshkent"],
    languages: ["Ingliz"],
    programs: [{ name: "Computer Science", tracks: ["software", "ai", "data"] }],
    admission: ["Kirish imtihoni: matematika (kamida 50%)", "Ingliz tili: IELTS 5.5 yoki unga teng"],
    funding: "Iqtidorli talabalarga stipendiya (merit-based)",
    fee: "81 000 000 so‘m / yil",
    website: "https://centralasian.uz",
  },
  {
    id: "amity",
    name: "Toshkentdagi Amity universiteti (Hindiston)",
    short: "Amity",
    type: "Xalqaro hamkorlik",
    cities: ["Toshkent"],
    languages: ["Ingliz"],
    programs: [{ name: "B.Tech Computer Science & Engineering", tracks: ["software", "computer"] }],
    admission: ["Kirish imtihoni: matematika va qobiliyat testi + suhbat", "Ingliz tili: IELTS 5.5"],
    funding: "To‘lov-kontrakt",
    website: "https://amity.uz",
  },
  {
    id: "akfa",
    name: "AKFA University",
    short: "AKFA",
    type: "Xususiy",
    cities: ["Toshkent"],
    languages: ["Ingliz"],
    programs: [
      { name: "Computer Engineering", tracks: ["computer"] },
      { name: "Software Engineering", tracks: ["software"] },
    ],
    admission: ["Universitetning o‘z kirish imtihonlari (yil davomida bir necha marta)"],
    funding: "Kontrakt va grant o‘rinlari — rasmiy saytda",
    website: "https://akfauniversity.org",
  },
];

/** Katalogdagi kasb → universitetdagi yo'nalish guruhi */
export const FIELD_TRACKS: Record<string, Track[]> = {
  frontend: ["software"],
  backend: ["software"],
  fullstack: ["software"],
  python: ["software", "data"],
  java: ["software"],
  cpp: ["software", "computer"],
  mobile: ["software"],
  ai: ["ai"],
  ml: ["ai", "data"],
  deeplearning: ["ai"],
  genai: ["ai", "software"],
  data_analytics: ["data"],
  data_science: ["data", "ai"],
  database: ["data", "software"],
  uiux: ["software"],
  graphic_design: ["software"],
  cybersecurity: ["security"],
  ethical_hacking: ["security"],
  cloud: ["computer", "telecom"],
  networks: ["telecom", "computer"],
  gamedev: ["software"],
  devops: ["software", "computer"],
  robotics: ["ai", "computer"],
  blockchain: ["software", "security"],
};

/** Berilgan kasblar uchun mos dasturlari bor universitetlar (eng ko'p mos kelgani birinchi) */
export function matchUniversities(fieldIds: string[]) {
  const wanted = new Map<Track, number>();
  fieldIds.forEach((id, rank) => {
    for (const t of FIELD_TRACKS[id] ?? []) wanted.set(t, Math.max(wanted.get(t) ?? 0, 3 - rank));
  });
  return UNIVERSITIES.map((u) => {
    const programs = u.programs.filter((p) => p.tracks.some((t) => wanted.has(t)));
    const score = programs.reduce((s, p) => s + Math.max(...p.tracks.map((t) => wanted.get(t) ?? 0)), 0);
    return { uni: u, programs, score };
  })
    .filter((m) => m.programs.length > 0)
    .sort((a, b) => b.score - a.score);
}

/** 2026-yilgi davlat qabuli (uzbmb.uz e'lonlari asosida) */
export const ADMISSION_2026 = {
  steps: [
    { title: "Ro‘yxatdan o‘tish", text: "my.uzbmb.uz saytida pasport ma’lumotlari bilan. 2026-yilda 5–25-iyun kunlari bo‘ldi." },
    { title: "Test sinovi", text: "2026-yilda 14–23-iyul kunlari o‘tkazildi. IT yo‘nalishlari uchun mutaxassislik fanlari — matematika va fizika." },
    { title: "Universitet tanlash", text: "2026-yildan “avval test, keyin tanlov”: natijangizni ko‘rib, 15 kun ichida OTM va yo‘nalishni tanlaysiz." },
  ],
  scoring:
    "Majburiy fanlar (ona tili, matematika, tarix) — har biri 10 savol × 1.1 ball. Matematika — 30 savol × 3.1 ball, fizika — 30 savol × 2.1 ball. Maksimal ball — 189.",
  officialSite: "https://uzbmb.uz",
};
