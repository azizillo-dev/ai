import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ClipboardList, Compass, Map, MessageCircle, Sparkles, UserRound } from "lucide-react";
import Butterflies from "@/components/Butterflies";
import FieldCard from "@/components/FieldCard";
import { ButterflyMark } from "@/components/Logo";
import { CATALOG, getField } from "@/lib/catalog";
import { OPPORTUNITIES } from "@/lib/opportunities";
import { getSession } from "@/lib/auth";
import heroImg from "@/public/hero-girl.jpg";

const STEPS = [
  {
    icon: UserRound,
    title: "Profil yarating",
    text: "Username va parol bilan ro‘yxatdan o‘ting, yoshingiz, bilim darajangiz, qiziqish va maqsadlaringizni belgilang.",
  },
  {
    icon: ClipboardList,
    title: "AI diagnostikasi",
    text: "Sun’iy intellekt aynan siz uchun 10 ta savol tuzadi: qiziqish, mantiq, ijodkorlik va ishlash uslubingiz tekshiriladi.",
  },
  {
    icon: Map,
    title: "Shaxsiy yo‘l xaritasi",
    text: "Javoblaringiz chuqur tahlil qilinadi: eng mos 3 ta yo‘nalish, kuchli tomonlar va vaqtingizga mos bosqichma-bosqich reja.",
  },
  {
    icon: MessageCircle,
    title: "AI mentor bilan o‘rganing",
    text: "Tushunmagan mavzuni so‘rang — mentor profilingizni biladi va oddiy hayotiy misollar bilan tushuntiradi.",
  },
];

const FEATURED = ["frontend", "ai", "uiux", "data_analytics", "cybersecurity", "mobile"];

export default async function Home() {
  const session = await getSession().catch(() => null);
  const startHref = session ? "/test" : "/register";
  const featured = FEATURED.map((id) => getField(id)).filter((f) => f !== undefined);

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="hero">
        <Butterflies />
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="pill">
              <span className="pill-dot">Yangi</span>
              Qizlar uchun AI karyera platformasi
            </span>
            <h1 className="h-display">
              O‘z yo‘lingni top.
              <br />
              Kelajagingni <span className="serif">yarat.</span>
            </h1>
            <p className="lead">
              HerPath AI sizga IT sohasidagi eng mos yo‘nalishni topish, uni bosqichma-bosqich o‘rganish va kelajakdagi kasbingizga
              tayyorlanishda yordam beradi — haqiqiy sun’iy intellekt tahlili asosida.
            </p>
            <div className="hero-cta">
              <Link href={startHref} className="btn btn-primary btn-lg">
                {session ? "AI testni boshlash" : "Bepul boshlash"} <ArrowRight size={18} />
              </Link>
              <Link href="#how" className="btn btn-outline btn-lg">
                Qanday ishlaydi?
              </Link>
            </div>
            <div className="hero-facts">
              <div>
                <strong>10 savol</strong>
                <span>shaxsiy AI diagnostika</span>
              </div>
              <div>
                <strong>{CATALOG.length} ta</strong>
                <span>IT yo‘nalishi</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>AI mentor yordami</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-frame">
              <Image
                src={heroImg}
                alt="Qo‘lida “My Future” daftarini ushlagan, kelajakka ishonch bilan qarayotgan qiz"
                priority
                placeholder="blur"
                sizes="(max-width: 960px) 92vw, 520px"
              />
            </div>
            <div className="hero-note">
              <span className="ic">
                <ButterflyMark size={20} />
              </span>
              <div>
                <strong>Kichik qadamlar</strong>
                <span>katta orzular sari olib boradi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= QANDAY ISHLAYDI ================= */}
      <section className="section section-tint" id="how">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Qanday ishlaydi</span>
            <h2 className="h-section">To‘rt qadamda o‘z yo‘nalishingizga</h2>
            <p className="lead" style={{ marginTop: 14 }}>
              Ro‘yxatdan o‘tishdan to shaxsiy o‘quv rejangizgacha — taxminan 10 daqiqa.
            </p>
          </div>
          <div className="grid-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="card step">
                <span className="icon-box">
                  <s.icon size={20} strokeWidth={1.8} />
                </span>
                <span className="step-num">0{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= YO'NALISHLAR ================= */}
      <section className="section" id="directions">
        <div className="container">
          <div className="section-head" style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between", maxWidth: "none" }}>
            <div style={{ maxWidth: 620 }}>
              <span className="eyebrow">IT yo‘nalishlari</span>
              <h2 className="h-section">Har bir kasbni yaqindan tanishing</h2>
              <p className="lead" style={{ marginTop: 14 }}>
                Yo‘nalish nima, qayerda qo‘llaniladi, nimani o‘rganish kerak va qancha maosh to‘lanadi — barchasi bir joyda.
              </p>
            </div>
            <Link href="/directions" className="link">
              Barcha {CATALOG.length} ta yo‘nalish <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid-3">
            {featured.map((f) => (
              <FieldCard key={f.id} field={f} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= AI MENTOR ================= */}
      <section className="section section-tint">
        <div className="container split">
          <div>
            <span className="eyebrow">AI mentor</span>
            <h2 className="h-section">
              Madina yoki Jasur bilan <span className="serif">gaplashing.</span>
            </h2>
            <p className="lead" style={{ marginTop: 14 }}>
              Ovozli AI mentor sizni tinglaydi va o‘zbek tilida jonli javob beradi — xuddi haqiqiy ustoz bilan suhbatdek. U profilingiz va
              test natijangizni biladi.
            </p>
            <ul className="check-list">
              <li>
                <span className="icon-box">
                  <Sparkles size={19} strokeWidth={1.8} />
                </span>
                <div>
                  <strong>Real vaqtdagi ovozli suhbat</strong>
                  <span>Tugma bosish shart emas — shunchaki gapiring. Mentor qo‘l harakatlari bilan tushuntiradi.</span>
                </div>
              </li>
              <li>
                <span className="icon-box">
                  <Compass size={19} strokeWidth={1.8} />
                </span>
                <div>
                  <strong>Animatsion video-darslar</strong>
                  <span>Har bir mavzu qisqa animatsion dars sifatida ovoz bilan tushuntiriladi, oxirida mini-test.</span>
                </div>
              </li>
              <li>
                <span className="icon-box">
                  <MessageCircle size={19} strokeWidth={1.8} />
                </span>
                <div>
                  <strong>Universitet tanlashda yordam</strong>
                  <span>O‘zbekistondagi IT universitetlari, kirish imtihonlari va sizga mos yo‘nalishlar.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="chat-preview" aria-label="Namuna suhbat">
            <div className="chat-preview-head">
              <span className="logo-mark">
                <ButterflyMark />
              </span>
              <div>
                <strong>HerPath AI Mentor</strong>
                <small>Namuna suhbat</small>
              </div>
            </div>
            <div className="chat-preview-body">
              <div className="bubble user">API nima? Hali ham tushunmadim</div>
              <div className="bubble ai">
                Restoranni tasavvur qiling. Siz — <b>ilova</b>, oshxona — <b>server</b>. Siz oshxonaga kirmaysiz, buyurtmani
                <b> ofitsiantga</b> berasiz, u esa tayyor taomni olib keladi.
                <br />
                <br />
                API — xuddi shu ofitsiant: ilova so‘rov yuboradi, API uni serverga yetkazadi va javobni qaytaradi.
              </div>
              <div className="bubble user">Endi tushundim, rahmat!</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= IMKONIYATLAR ================= */}
      <section className="section" id="opportunities">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Imkoniyatlar</span>
            <h2 className="h-section">Tanlovlar, grantlar va bepul kurslar</h2>
            <p className="lead" style={{ marginTop: 14 }}>
              Qizlar uchun ochiq bo‘lgan nufuzli dasturlar. Muddatlar har yili yangilanadi — arizadan oldin rasmiy saytni tekshiring.
            </p>
          </div>
          <div className="grid-3">
            {OPPORTUNITIES.map((o) => (
              <article key={o.title} className="card opp">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span className="org">{o.org}</span>
                  <span className="tag">{o.type}</span>
                </div>
                <h3>{o.title}</h3>
                <p>{o.description}</p>
                <div className="meta">
                  <span className="muted">{o.when}</span>
                  <a href={o.link} target="_blank" rel="noopener noreferrer" className="link" aria-label={`${o.title} — rasmiy sayt`}>
                    Sayt <ArrowUpRight size={15} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>10 daqiqada o‘z yo‘nalishingizni bilib oling</h2>
              <p>Bepul. Faqat username va parol kifoya — qolganini sun’iy intellekt siz bilan birga qiladi.</p>
            </div>
            <Link href={startHref} className="btn btn-light btn-lg">
              {session ? "Testni boshlash" : "Ro‘yxatdan o‘tish"} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
