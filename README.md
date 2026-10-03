# HerPath AI

**O‘z yo‘lingni top. Kelajagingni yarat.**

Qizlar uchun sun’iy intellekt asosidagi IT karyera platformasi:

- **Haqiqiy ro‘yxatdan o‘tish** — username + parol (bcrypt bilan shifrlanadi), 30 kunlik xavfsiz sessiya.
- **AI diagnostika** — AI har bir foydalanuvchi profiliga moslab 10 ta savol tuzadi (qiziqish, mantiq, ijodkorlik, texnik yondashuv, ishlash uslubi, motivatsiya), so‘ng javoblarni tahlil qilib beradi:
  eng mos 3 ta yo‘nalish (foiz va sabab bilan), qobiliyatlar xaritasi, kuchli/zaif tomonlar, haftalik vaqtga mos yo‘l xaritasi va birinchi hafta rejasi.
- **AI Mentor** — profil va test natijasini biladigan, javobni yozilayotgandek (streaming) qaytaradigan chat. Suhbat tarixi bazada saqlanadi.
- **24 ta IT yo‘nalishi katalogi** — har biri uchun alohida sahifa.
- **Ovozli AI mentor (Madina yoki Jasur)** — beligacha ko‘rinadigan, qo‘l harakatlari bilan gapiradigan qahramon. Gemini Live orqali real vaqtda suhbat: tugma bosmasdan gapiriladi, mentor gapini bo‘lish mumkin. API kalit brauzerga chiqmaydi (bir martalik token).
- **Animatsion video-darslar** — AI har bir mavzu uchun 5–7 sahnali dars yozadi, sahnalar ovoz va animatsiya bilan ko‘rsatiladi, oxirida mini-test. Darslar va ovozlar bir marta yaratilib, bazada keshlanadi.
- **IT universitetlari** — O‘zbekistondagi IT universitetlari, davlat qabuli tartibi va test natijasiga mos tavsiyalar.
- **Kapalaklar** — hero qismida canvas’da uchadi, desktopda sichqonchaga ergashadi, telefonda ekranga tegilgan joyga uchib keladi.

## Texnologiyalar

| Qism | Tanlov | Nega |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript | Sahifalar serverda tayyorlanadi, JS faqat interaktiv qismlarga yuklanadi; Vercel bilan to‘g‘ridan-to‘g‘ri ishlaydi |
| Baza | Neon Postgres (Vercel’da bepul) | Serverless’ga mos; lokal ishlatishda avtomatik PGlite (`.data/`) |
| AI | Google Gemini (asosiy) + Groq (zaxira) | Ikkalasi ham bepul; biri limitga yetsa, avtomatik ikkinchisiga o‘tadi |
| Auth | bcryptjs + JWT (jose), httpOnly cookie | Tashqi xizmatsiz, tez |
| Animatsiya | Canvas 2D + requestAnimationFrame | DOM’ga yuk yo‘q; ko‘rinmay qolganda to‘xtaydi; `prefers-reduced-motion` hurmat qilinadi |
| Shriftlar/rasm | `next/font`, `next/image` (AVIF/WebP) | Layout siljishi yo‘q, rasm avtomatik siqiladi |

## Lokal ishga tushirish

```bash
npm install
cp .env.example .env.local     # va GEMINI_API_KEY (yoki GROQ_API_KEY) ni yozing
npm run dev                    # http://localhost:3000
```

`DATABASE_URL` bo‘sh bo‘lsa, baza avtomatik `.data/pglite` papkasida yaratiladi — hech narsa o‘rnatish shart emas.

### Bepul AI kalitlari

- **Gemini**: <https://aistudio.google.com/apikey> → “Create API key”
- **Groq**: <https://console.groq.com/keys> → “Create API Key”

Ikkalasini ham qo‘ysangiz, ishonchlilik oshadi (biri band bo‘lsa, ikkinchisi javob beradi).

**DeepSeek** (ixtiyoriy): <https://platform.deepseek.com/api_keys>. Bepul emas — balansni to‘ldirish kerak, lekin juda arzon.
`DEEPSEEK_API_KEY` qo‘yilsa, zaxira sifatida ishlatiladi; asosiy qilish uchun `AI_PRIMARY=deepseek`.

## Vercel’ga joylash

1. Loyihani GitHub’ga yuklang (`legacy/` papkasi `.vercelignore` orqali chiqarib tashlanadi).
2. <https://vercel.com/new> → repozitoriyni import qiling (Framework: Next.js avtomatik aniqlanadi).
3. **Storage** → **Create Database** → **Neon (Postgres)** → loyihaga ulang. `DATABASE_URL` avtomatik qo‘shiladi.
4. **Settings → Environment Variables**:
   - `GEMINI_API_KEY` va/yoki `GROQ_API_KEY`
   - `AUTH_SECRET` — uzun tasodifiy satr: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - (ixtiyoriy) `NEXT_PUBLIC_SITE_URL` — masalan `https://herpath.vercel.app`
5. **Deploy**. Jadvallar birinchi so‘rovda avtomatik yaratiladi.

## Limitlar (bepul AI kvotasini himoya qilish uchun)

- Test: bir foydalanuvchi uchun kuniga 6 marta
- Mentor: bir foydalanuvchi uchun kuniga 80 ta savol

`app/api/assessment/start/route.ts` va `app/api/chat/route.ts` dagi `DAILY_LIMIT` orqali o‘zgartiriladi.

## Tuzilma

```
app/
  page.tsx                 bosh sahifa (hero + kapalaklar)
  register/ login/         ro‘yxatdan o‘tish va kirish
  test/                    AI diagnostika (10 savol)
  dashboard/               shaxsiy tahlil natijalari
  mentor/                  AI mentor chat
  directions/              IT yo‘nalishlari katalogi
  api/                     auth, assessment, chat
components/Butterflies.tsx kapalaklar animatsiyasi
lib/ai.ts                  Gemini/Groq + fallback + streaming
lib/assessment.ts          savol/tahlil promptlari va tekshiruv
lib/db.ts                  Neon / PGlite
data/catalog.json          24 ta yo‘nalish ma’lumotlari
legacy/                    eski Flask versiyasi (faqat arxiv)
```
