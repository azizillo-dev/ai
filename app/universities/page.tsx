import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Info } from "lucide-react";
import UniversityCard from "@/components/UniversityCard";
import { getSession } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import type { AssessmentResult } from "@/lib/assessment";
import { ADMISSION_2026, matchUniversities } from "@/lib/universities";
import UniversitiesView from "./UniversitiesView";

export const metadata: Metadata = {
  title: "IT universitetlari",
  description: "O‘zbekistondagi IT yo‘nalishidagi universitetlar: qabul tartibi, imtihon fanlari, ta’lim tili va narxlar.",
};

export default async function UniversitiesPage() {
  const session = await getSession().catch(() => null);
  const latest = session
    ? await queryOne<{ result: AssessmentResult }>(
        "SELECT result FROM assessments WHERE user_id = $1 AND result IS NOT NULL ORDER BY id DESC LIMIT 1",
        [session.uid]
      ).catch(() => null)
    : null;
  const directions = latest?.result.directions ?? [];
  const matches = directions.length ? matchUniversities(directions.map((d) => d.id)).slice(0, 4) : [];

  return (
    <div className="container">
      <div className="page-head" style={{ maxWidth: 720 }}>
        <span className="eyebrow">Maktab o‘quvchilari uchun</span>
        <h1>IT bo‘yicha universitetlar</h1>
        <p>
          IT ga qiziqasiz, lekin qaysi universitet va yo‘nalishga topshirishni bilmayapsizmi? Bu yerda O‘zbekistondagi IT
          universitetlari, ularning yo‘nalishlari, kirish talablari va qabul tartibi jamlangan.
        </p>
      </div>

      {/* Davlat qabuli qanday o'tadi */}
      <section className="card" style={{ marginTop: 24 }}>
        <div className="card-head">
          <h2>Davlat universitetlariga qabul qanday o‘tadi</h2>
          <a href={ADMISSION_2026.officialSite} target="_blank" rel="noopener noreferrer" className="link">
            uzbmb.uz <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="grid-3">
          {ADMISSION_2026.steps.map((s, i) => (
            <div key={s.title} className="adm-step">
              <span className="tl-num" style={{ position: "static" }}>
                {i + 1}
              </span>
              <div>
                <strong>{s.title}</strong>
                <p>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="muted" style={{ fontSize: 14, marginTop: 18 }}>
          {ADMISSION_2026.scoring}
        </p>
        <div className="alert info" style={{ marginTop: 16 }}>
          <Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Xalqaro va xususiy universitetlar odatda o‘z kirish imtihonini o‘tkazadi va ingliz tili sertifikati (IELTS) so‘raydi.
            Hozirdan tayyorlaning: <b>matematika</b>, <b>fizika</b> va <b>ingliz tili</b> — IT ga kirishning uchta kaliti.
          </span>
        </div>
      </section>

      {/* Shaxsiy tavsiya */}
      {matches.length > 0 ? (
        <section style={{ marginTop: 40 }}>
          <span className="eyebrow">Sizning test natijangiz bo‘yicha</span>
          <h2 className="h-section" style={{ fontSize: "clamp(24px, 3vw, 30px)" }}>
            {directions[0].title} uchun mos universitetlar
          </h2>
          <p className="muted" style={{ marginTop: 8 }}>
            Belgilangan yo‘nalishlar sizning eng mos kasblaringizga to‘g‘ri keladi.
          </p>
          <div className="grid-2" style={{ marginTop: 20 }}>
            {matches.map((m) => (
              <UniversityCard key={m.uni.id} uni={m.uni} highlight={m.programs.map((p) => p.name)} />
            ))}
          </div>
        </section>
      ) : (
        <div className="card advice" style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ maxWidth: 560 }}>
            AI testdan o‘tsangiz, natijangizga qarab sizga mos universitet va yo‘nalishlarni alohida ko‘rsatamiz.
          </p>
          <Link href={session ? "/test" : "/register"} className="btn btn-primary">
            {session ? "Testni topshirish" : "Bepul boshlash"} <ArrowRight size={17} />
          </Link>
        </div>
      )}

      <section style={{ margin: "48px 0 88px" }}>
        <h2 className="h-section" style={{ fontSize: "clamp(24px, 3vw, 30px)", marginBottom: 20 }}>
          Barcha universitetlar
        </h2>
        <UniversitiesView />
        <p className="muted" style={{ fontSize: 13, marginTop: 24 }}>
          Ma’lumotlar 2026-yil holatiga rasmiy saytlardan olingan. Qabul muddatlari, kvotalar va narxlar har yili o‘zgaradi — hujjat
          topshirishdan oldin albatta rasmiy saytni tekshiring.
        </p>
      </section>
    </div>
  );
}
