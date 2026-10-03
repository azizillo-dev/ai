import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleCheck, GraduationCap, MessageCircle, RotateCcw, Sparkles, TrendingUp } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import type { AssessmentResult } from "@/lib/assessment";
import FirstWeek from "./FirstWeek";
import Narrator from "@/components/Narrator";
import { matchUniversities } from "@/lib/universities";

export const metadata: Metadata = { title: "Kabinet" };

const dateFmt = new Intl.DateTimeFormat("uz-UZ", { day: "numeric", month: "long", year: "numeric" });

export default async function Dashboard() {
  const user = await requireUser("/dashboard");
  const latest = await queryOne<{ id: number; result: AssessmentResult; finished_at: string }>(
    "SELECT id, result, finished_at FROM assessments WHERE user_id = $1 AND result IS NOT NULL ORDER BY id DESC LIMIT 1",
    [user.id]
  );

  if (!latest) {
    return (
      <div className="container">
        <div className="page-head">
          <h1>Salom, {user.name}!</h1>
          <p>Profilingiz tayyor. Endi eng muhim qadam qoldi.</p>
        </div>
        <div className="card empty" style={{ margin: "24px 0 80px" }}>
          <div className="pulse-orb">
            <Sparkles size={30} />
          </div>
          <h2 style={{ fontSize: 24 }}>AI diagnostikadan o‘ting</h2>
          <p>
            10 ta savolga javob bering — sun’iy intellekt sizga eng mos IT yo‘nalishlarini, kuchli tomonlaringizni va shaxsiy o‘quv
            rejangizni tayyorlab beradi.
          </p>
          <div className="hero-cta" style={{ marginTop: 4, justifyContent: "center" }}>
            <Link href="/test" className="btn btn-primary btn-lg">
              Testni boshlash <ArrowRight size={18} />
            </Link>
            <Link href="/mentor" className="btn btn-outline btn-lg">
              Mentorga savol berish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const r = latest.result;
  const unis = matchUniversities(r.directions.map((d) => d.id)).slice(0, 3);
  const top = r.directions[0];
  const narration = [
    `${user.name}, natijangiz tayyor! Sizning profilingiz — ${r.profile_type}. ${r.summary}`,
    top ? `Sizga eng mos yo‘nalish — ${top.title}, ${top.match} foiz. ${top.why}` : "",
    r.roadmap[0] ? `Birinchi qadamingiz: ${r.roadmap[0].title}. ${r.roadmap[0].description}` : "",
    r.advice,
  ].filter(Boolean);
  const finished = latest.finished_at ? dateFmt.format(new Date(latest.finished_at)) : "";

  return (
    <div className="container">
      <div className="page-head" style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1>Salom, {user.name}!</h1>
          <p>Bu sizning shaxsiy AI tahlilingiz{finished ? ` — ${finished}` : ""}.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Narrator parts={narration} />
          <Link href="/mentor" className="btn btn-primary">
            <MessageCircle size={17} /> AI mentor
          </Link>
          <Link href="/test" className="btn btn-outline">
            <RotateCcw size={16} /> Qayta topshirish
          </Link>
        </div>
      </div>

      <div className="dash">
        {/* Umumiy xulosa */}
        <section className="card result-hero full">
          <span className="eyebrow">Sizning profilingiz</span>
          <h2 className="type">{r.profile_type}</h2>
          <p>{r.summary}</p>
          {r.logic_score && r.logic_score.total > 0 && (
            <p style={{ marginTop: 14, fontSize: 14, color: "rgba(255,255,255,.62)" }}>
              Mantiqiy savollar: {r.logic_score.correct}/{r.logic_score.total} to‘g‘ri
            </p>
          )}
        </section>

        <div className="dash-col">
          {/* Mos yo'nalishlar */}
          <section className="card">
            <div className="card-head">
              <h2>Sizga eng mos yo‘nalishlar</h2>
            </div>
            {r.directions.map((d) => (
              <div className="dir" key={d.id}>
                <div className="dir-top">
                  <h3>
                    <Link href={`/directions/${d.id}`}>{d.title}</Link>
                  </h3>
                  <span className="dir-pct">{d.match}%</span>
                </div>
                <div className="bar">
                  <i style={{ width: `${d.match}%` }} />
                </div>
                <p>{d.why}</p>
              </div>
            ))}
          </section>

          {/* Yo'l xaritasi */}
          <section className="card">
            <div className="card-head">
              <h2>Shaxsiy yo‘l xaritangiz</h2>
              <span className="tag">{r.directions[0]?.title}</span>
            </div>
            <ol className="timeline">
              {r.roadmap.map((s, i) => (
                <li key={i}>
                  <span className="tl-num">{i + 1}</span>
                  <h3>
                    {s.title}
                    {s.duration && <span className="dur">{s.duration}</span>}
                  </h3>
                  {s.description && <p>{s.description}</p>}
                  {s.resources.length > 0 && (
                    <div className="res">
                      {s.resources.map((res) => (
                        <span key={res}>{res}</span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="dash-col">
          {/* Qobiliyatlar */}
          {r.traits.length > 0 && (
            <section className="card">
              <div className="card-head">
                <h2>Qobiliyatlar xaritasi</h2>
              </div>
              {r.traits.map((t) => (
                <div className="trait" key={t.name}>
                  <div className="trait-top">
                    <span>{t.name}</span>
                    <b>{t.score}</b>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${t.score}%` }} />
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Kuchli tomonlar va o'sish nuqtalari */}
          <section className="card">
            <div className="card-head">
              <h2>Kuchli tomonlaringiz</h2>
            </div>
            <ul className="bullets">
              {r.strengths.map((s) => (
                <li key={s}>
                  <CircleCheck size={17} color="var(--success)" />
                  {s}
                </li>
              ))}
            </ul>
            {r.growth.length > 0 && (
              <>
                <div className="card-head" style={{ marginTop: 24 }}>
                  <h2>Rivojlantirish kerak</h2>
                </div>
                <ul className="bullets">
                  {r.growth.map((s) => (
                    <li key={s}>
                      <TrendingUp size={17} color="var(--violet-600)" />
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {r.first_week.length > 0 && (
            <section className="card">
              <FirstWeek tasks={r.first_week} storageKey={`hp-week-${latest.id}`} />
            </section>
          )}

          {unis.length > 0 && (
            <section className="card">
              <div className="card-head">
                <h2>Sizga mos universitetlar</h2>
              </div>
              <ul className="bullets">
                {unis.map((m) => (
                  <li key={m.uni.id}>
                    <GraduationCap size={17} color="var(--violet-600)" />
                    <span>
                      <b style={{ color: "var(--ink)" }}>{m.uni.short}</b> — {m.programs.map((p) => p.name).join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/universities" className="link" style={{ marginTop: 14 }}>
                Qabul tartibi va barcha universitetlar <ArrowRight size={16} />
              </Link>
            </section>
          )}

          {r.advice && (
            <section className="card advice">
              <div className="card-head" style={{ marginBottom: 10 }}>
                <h2>Mentor maslahati</h2>
              </div>
              <p>{r.advice}</p>
              <Link href="/mentor" className="link" style={{ marginTop: 14 }}>
                Mentor bilan davom etish <ArrowRight size={16} />
              </Link>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
