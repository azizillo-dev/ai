import type { Metadata } from "next";
import { CATALOG } from "@/lib/catalog";
import CatalogGrid from "./CatalogGrid";

export const metadata: Metadata = {
  title: "IT yo‘nalishlari",
  description: "24 ta IT yo‘nalishi: nima ekanligi, qayerda qo‘llanilishi, nimani o‘rganish kerakligi va maoshlar.",
};

export default function DirectionsPage() {
  return (
    <div className="container">
      <div className="page-head" style={{ maxWidth: 680 }}>
        <span className="eyebrow">Katalog</span>
        <h1>IT yo‘nalishlari</h1>
        <p>
          {CATALOG.length} ta kasb — har biri haqida sodda tushuntirish, real qo‘llanilish sohalari, o‘rganish rejasi, loyiha g‘oyalari
          va taxminiy maoshlar.
        </p>
      </div>
      <div style={{ padding: "28px 0 88px" }}>
        <CatalogGrid fields={CATALOG} />
      </div>
    </div>
  );
}
