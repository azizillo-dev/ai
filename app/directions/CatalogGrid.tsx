"use client";

import { useState } from "react";
import FieldCard from "@/components/FieldCard";
import { CATEGORIES, type CategoryId, type Field } from "@/lib/catalog";

export default function CatalogGrid({ fields }: { fields: Field[] }) {
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const shown = cat === "all" ? fields : fields.filter((f) => f.category === cat);

  return (
    <>
      <div className="chips" role="toolbar" aria-label="Toifa bo‘yicha saralash">
        <button className="chip" aria-pressed={cat === "all"} onClick={() => setCat("all")}>
          Barchasi
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} className="chip" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
            {c.title}
          </button>
        ))}
      </div>
      <div className="grid-3">
        {shown.map((f) => (
          <FieldCard key={f.id} field={f} />
        ))}
      </div>
    </>
  );
}
