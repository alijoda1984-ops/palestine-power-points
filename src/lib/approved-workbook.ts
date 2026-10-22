import rows from "@/data/approved-workbook.json";
import type { AgreementMode, CatalogItem } from "./types";

export const WORKBOOK_SOURCE = "إكسل المستخدم — منقول من صور الكتاب المعتمدة؛ القيم الصريحة فقط";

export function approvedWorkbookItems(mode: AgreementMode): CatalogItem[] {
  return rows.flatMap((row) => {
    const points = row[mode];
    const missingOtherColumn = mode === "goods" && row.notes === "قيمة المصانعة غير واضحة/غير مدونة في الجدول";
    if (row.status !== "مقروء من الصورة" ||
      (!missingOtherColumn && /تحقق|مراجعة|غير واضحة|غير مدونة/.test(row.notes)) ||
      typeof points !== "number" || !Number.isFinite(points) || points < 0 || !row.name.trim()) return [];
    return [{
      id: `workbook-${mode}-row-${row.row}`,
      section: row.section,
      code: "", // The workbook supplies no book codes; internal IDs are not book codes.
      name: row.name,
      points,
      unit: row.unit,
      sourceRow: row.row,
      bookPage: row.bookPage,
      sourceNotes: row.notes,
    }];
  });
}

export function mergeWorkbookItems(existing: CatalogItem[], mode: AgreementMode): CatalogItem[] {
  const merged = new Map(existing.map((item) => [item.id, item]));
  for (const item of approvedWorkbookItems(mode)) {
    if (!merged.has(item.id)) merged.set(item.id, item);
  }
  return [...merged.values()];
}