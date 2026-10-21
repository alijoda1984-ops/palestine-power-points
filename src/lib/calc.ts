import type { ProjectLine } from "./types";

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
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(l);
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

export const fmt = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 2 });
