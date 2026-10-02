export interface Opportunity {
  title: string;
  org: string;
  type: "Tanlov" | "Grant" | "Kurs" | "Amaliyot";
  description: string;
  when: string;
  link: string;
}

/** Muddatlar har yili o'zgaradi — shuning uchun "odatda" deb yozilgan, aniq sana rasmiy saytda. */
export const OPPORTUNITIES: Opportunity[] = [
  {
    title: "Technovation Girls",
    org: "Technovation",
    type: "Tanlov",
    description:
      "Qizlar uchun xalqaro texnologiya tanlovi: jamoa bo‘lib real muammoni hal qiluvchi mobil ilova yoki AI loyiha va biznes reja tayyorlanadi.",
    when: "Odatda kuzda ro‘yxat ochiladi, bahorda topshiriladi",
    link: "https://technovationchallenge.org",
  },
  {
    title: "TechGirls almashinuv dasturi",
    org: "AQSH Davlat departamenti",
    type: "Grant",
    description:
      "15–17 yoshli qizlar uchun AQSHda STEM bo‘yicha to‘liq moliyalashtiriladigan yozgi almashinuv dasturi.",
    when: "Ariza odatda qish oylarida qabul qilinadi",
    link: "https://techgirlsglobal.org",
  },
  {
    title: "Google Summer of Code",
    org: "Google Open Source",
    type: "Amaliyot",
    description:
      "Ochiq kodli loyihalarda mentor bilan ishlash va stipendiya olish imkoniyati. Real loyihada tajriba orttirish uchun ajoyib start.",
    when: "Ariza odatda mart–aprel oylarida",
    link: "https://summerofcode.withgoogle.com",
  },
  {
    title: "SheCodes Foundation",
    org: "SheCodes",
    type: "Kurs",
    description: "Ayollar va qizlar uchun veb-dasturlash (HTML, CSS, JavaScript, React) bo‘yicha stipendiyali onlayn kurslar.",
    when: "Qabul muntazam ochiladi",
    link: "https://www.shecodes.io/foundation",
  },
  {
    title: "CS50: Introduction to Computer Science",
    org: "Harvard University",
    type: "Kurs",
    description: "Dasturlash va informatika asoslari bo‘yicha dunyodagi eng mashhur bepul kurs. Yakunida bepul sertifikat olish mumkin.",
    when: "Istalgan vaqtda boshlash mumkin",
    link: "https://cs50.harvard.edu/x/",
  },
  {
    title: "IT Park dasturlari",
    org: "IT Park Uzbekistan",
    type: "Amaliyot",
    description: "O‘zbekistondagi IT ta’lim dasturlari, inkubatsiya va amaliyot imkoniyatlari. Yangi e’lonlarni rasmiy saytdan kuzatib boring.",
    when: "E’lonlar yil davomida",
    link: "https://it-park.uz",
  },
];
