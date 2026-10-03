import { ArrowUpRight, Check, GraduationCap, Languages, MapPin } from "lucide-react";
import type { University } from "@/lib/universities";

export default function UniversityCard({ uni, highlight = [] }: { uni: University; highlight?: string[] }) {
  return (
    <article className="card uni">
      <div className="uni-top">
        <span className="uni-short">{uni.short}</span>
        <span className="tag">{uni.type}</span>
      </div>
      <h3>{uni.name}</h3>

      <div className="uni-meta">
        <span>
          <MapPin size={15} /> {uni.cities.join(", ")}
        </span>
        <span>
          <Languages size={15} /> {uni.languages.join(", ")}
        </span>
      </div>

      <div className="uni-programs">
        {uni.programs.map((p) => (
          <span key={p.name} className={highlight.includes(p.name) ? "on" : undefined}>
            {highlight.includes(p.name) && <Check size={13} />}
            {p.name}
          </span>
        ))}
      </div>

      <ul className="uni-adm">
        {uni.admission.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>

      <div className="uni-foot">
        <div>
          <span className="muted" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5 }}>
            <GraduationCap size={15} /> {uni.funding}
          </span>
          {uni.fee && <strong className="uni-fee">{uni.fee}</strong>}
        </div>
        <a href={uni.website} target="_blank" rel="noopener noreferrer" className="link" aria-label={`${uni.short} rasmiy sayti`}>
          Rasmiy sayt <ArrowUpRight size={15} />
        </a>
      </div>
    </article>
  );
}
