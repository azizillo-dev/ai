import { BrainCircuit, ChartColumn, Cloud, Code, Gamepad2, Palette, ShieldCheck } from "lucide-react";
import type { CategoryId } from "@/lib/catalog";

const ICONS = {
  dasturlash: Code,
  ai: BrainCircuit,
  data: ChartColumn,
  design: Palette,
  security: ShieldCheck,
  networks: Cloud,
  other: Gamepad2,
} satisfies Record<CategoryId, unknown>;

export default function CategoryIcon({ category, size = 20 }: { category: CategoryId; size?: number }) {
  const Icon = ICONS[category] ?? Code;
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}
