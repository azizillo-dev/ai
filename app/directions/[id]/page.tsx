import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import CategoryIcon from "@/components/CategoryIcon";
import { CATALOG, categoryTitle, getField } from "@/lib/catalog";

export function generateStaticParams() {
  return CATALOG.map((f) => ({ id: f.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const field = getField((await params).id);
  return field ? { title: field.title, description: field.short_desc } : {};
}

const stripStage = (s: string) => s.replace(/^\d+-bosqich:\s*/i, "");

export default async function FieldPage({ params }: { params: Promise<{ id: string }> }) {
  const field = getField((await params).id);
  if (!field) notFound();

  const mentorQ = `${field.title} yo‘nalishini o‘rganishni qanday boshlasam bo‘ladi?`;

  return (
    <div className="container">
      <div className="page-head">
        <Link href="/directions" className="breadcrumb">
          <ArrowLeft size={15} /> Barcha yo‘nalishlar
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span className="icon-box" style={{ width: 52, height: 52, borderRadius: 14 }}>
            <CategoryIcon category={field.category} size={24} />
          </span>
          <span className="tag">{categoryTitle(field.category)}</span>
        </div>
        <h1 style={{ marginTop: 16 }}>{field.title}</h1>
        <p className="lead" style={{ maxWidth: 680 }}>
          {field.short_desc}
        </p>
      </div>

      <div className="detail" style={{ paddingTop: 24 }}>
        <div className="dash-col">
          <section className="card">
            <h2>Bu yo‘nalish nima?</h2>
            <p className="prose">{field.what_is}</p>
          </section>
          <section className="card">
            <h2>Mutaxassis nima ish qiladi?</h2>
            <p className="prose">{field.what_they_do}</p>
          </section>
          <section className="card">
            <h2>Nimalarni o‘rganish kerak</h2>
            <ol className="num-list">
              {field.what_to_learn.map((s) => (
                <li key={s}>{stripStage(s)}</li>
              ))}
            </ol>
          </section>
          <section className="card">
            <h2>Qayerlarda qo‘llaniladi</h2>
            <ul className="bullets">
              {field.applications.map((a) => (
                <li key={a}>
                  <span style={{ width: 6, height: 6, borderRadius: 6, background: "var(--violet-400)", marginTop: 9, flexShrink: 0 }} />
                  {a}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="dash-col">
          <section className="card">
            <h2>Loyiha g‘oyalari</h2>
            {field.projects.map((p) => (
              <div className="lvl" key={p.title}>
                <small>{p.level}</small>
                <span>{p.title}</span>
              </div>
            ))}
          </section>
          <section className="card">
            <h2>Kasblar va taxminiy maosh</h2>
            {field.career_roles.map((r) => (
              <div className="kv" key={r.role}>
                <span>{r.role}</span>
                <b>{r.salary}</b>
              </div>
            ))}
            <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>
              Maoshlar taxminiy — kompaniya, shahar va tajribaga qarab farq qiladi.
            </p>
          </section>
          <section className="card advice sticky-card">
            <h2>Savolingiz bormi?</h2>
            <p>AI mentor bu yo‘nalishni sizning darajangizga moslab tushuntirib beradi.</p>
            <Link href={`/mentor?q=${encodeURIComponent(mentorQ)}`} className="btn btn-primary btn-block" style={{ marginTop: 16 }}>
              <MessageCircle size={17} /> Mentordan so‘rash
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
