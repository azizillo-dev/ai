import raw from "@/data/catalog.json";

export type CategoryId = "dasturlash" | "ai" | "data" | "design" | "security" | "networks" | "other";

export interface Field {
  id: string;
  category: CategoryId;
  title: string;
  short_desc: string;
  what_is: string;
  applications: string[];
  what_they_do: string;
  what_to_learn: string[];
  projects: { level: string; title: string }[];
  career_roles: { role: string; salary: string }[];
}

export const CATEGORIES: { id: CategoryId; title: string }[] = [
  { id: "dasturlash", title: "Dasturlash" },
  { id: "ai", title: "Sun’iy intellekt" },
  { id: "data", title: "Ma’lumotlar" },
  { id: "design", title: "Dizayn" },
  { id: "security", title: "Kiberxavfsizlik" },
  { id: "networks", title: "Tarmoq va bulut" },
  { id: "other", title: "Boshqa yo‘nalishlar" },
];

export const CATALOG = raw as Field[];

export function getField(id: string): Field | undefined {
  return CATALOG.find((f) => f.id === id);
}

export function categoryTitle(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.title ?? id;
}

/** AI ga yuboriladigan qisqa ro'yxat: "id — nomi" */
export function catalogIndexForPrompt(): string {
  return CATALOG.map((f) => `${f.id} — ${f.title}`).join("\n");
}
