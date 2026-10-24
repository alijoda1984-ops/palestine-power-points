import { MODE_LABEL, VERIFY_NOTE, type Project, type ProjectLine } from "./types";

const r2 = (n: number) => Math.round(n * 100) / 100;

export function lineTotal(l: Pick<ProjectLine, "quantity" | "pointsPerItem">): number {
  return r2(l.quantity * l.pointsPerItem);
}

export interface SectionGroup {
  section: string;
  lines: ProjectLine[];
  subtotal: number;
}

export function groupBySection(lines: ProjectLine[]): SectionGroup[] {
  const map = new Map<string, ProjectLine[]>();
  for (const l of lines) {
    const k = l.section || "بدون قسم";
    const existing = map.get(k);
    if (existing) existing.push(l);
    else map.set(k, [l]);
  }
  return [...map.entries()].map(([section, ls]) => ({
    section,
    lines: ls,
    subtotal: r2(ls.reduce((s, l) => s + lineTotal(l), 0)),
  }));
}

export function totalPoints(lines: ProjectLine[]): number {
  return r2(lines.reduce((s, l) => s + lineTotal(l), 0));
}

/** Labor only. Goods/material cost is never calculated. */
export function laborTotal(lines: ProjectLine[], pricePerPoint: number): number {
  return r2(totalPoints(lines) * (pricePerPoint || 0));
}

/** Unsaved field estimate: no catalog values or material prices involved. */
export function quickLabor(points: string, price: string): number | null {
  const parse = (s: string) => Number(s.trim().replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[٫,]/g, "."));
  if (!points.trim() || !price.trim()) return null;
  const p = parse(points), rate = parse(price);
  if (!Number.isFinite(p) || !Number.isFinite(rate) || p < 0 || rate < 0 || !Number.isFinite(p * rate)) return null;
  return r2(p * rate);
}

export function projectSummary(p: Project): string {
  return [
    "كيلة الأعمال الكهربائية",
    `المشروع: ${p.name}`,
    p.ownerName ? `الزبون: ${p.ownerName}` : "",
    p.date ? `التاريخ: ${p.date}` : "",
    `نوع الاتفاق: ${MODE_LABEL[p.mode]}`,
    `مجموع النقاط: ${fmt(totalPoints(p.lines))}`,
    `سعر النقطة: ${fmt(p.pricePerPoint)} شيكل`,
    `أجرة العمل: ${fmt(laborTotal(p.lines, p.pricePerPoint))} شيكل`,
    "أجرة عمل فقط، لا تشمل تكلفة المواد أو البضاعة.",
    p.lines.some((l) => l.isTest) ? "تحذير: يحتوي المشروع على قيم تجريبية — ليست رسمية." : "",
    VERIFY_NOTE,
  ].filter(Boolean).join("\n");
}

export const fmt = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 2 });
