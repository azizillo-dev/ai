import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categoryTitle, type Field } from "@/lib/catalog";
import CategoryIcon from "./CategoryIcon";

export default function FieldCard({ field }: { field: Field }) {
  return (
    <Link href={`/directions/${field.id}`} className="card card-hover field-card">
      <div className="top">
        <span className="icon-box">
          <CategoryIcon category={field.category} />
        </span>
        <span className="tag">{categoryTitle(field.category)}</span>
      </div>
      <h3>{field.title}</h3>
      <p>{field.short_desc}</p>
      <span className="more">
        Batafsil <ArrowRight size={15} />
      </span>
    </Link>
  );
}
