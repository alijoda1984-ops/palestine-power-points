import type { AgreementMode, Catalog, CatalogItem } from "./types";

/**
 * SAMPLE TEST ROWS ONLY. These numbers are invented placeholders for trying
 * the app and are NOT union-book values. Replace via the data-management page.
 */
const TEST_GOODS: CatalogItem[] = [
  { id: "t1", section: "قسم تجريبي أ", code: "TEST-01", name: "بند تجريبي 1", points: 1 },
  { id: "t2", section: "قسم تجريبي أ", code: "TEST-02", name: "بند تجريبي 2", points: 2 },
  { id: "t3", section: "قسم تجريبي أ", code: "TEST-03", name: "بند تجريبي 3", points: 0.5 },
  { id: "t4", section: "قسم تجريبي ب", code: "TEST-04", name: "بند تجريبي 4", points: 3 },
  { id: "t5", section: "قسم تجريبي ب", code: "TEST-05", name: "بند تجريبي 5", points: 1.5 },
  { id: "t6", section: "قسم تجريبي ج", code: "TEST-06", name: "بند تجريبي 6", points: 4 },
];

export function defaultCatalog(mode: AgreementMode): Catalog {
  if (mode === "goods")
    return {
      mode,
      isTest: true,
      sourceLabel: "بيانات تجريبية — ليست قيماً رسمية",
      importedAt: null,
      items: TEST_GOODS,
    };
  // Manufacturing has its own ruleset; nothing until the 2025 book is imported.
  return { mode, isTest: true, sourceLabel: "لا توجد بيانات — بانتظار كتاب 2025", importedAt: null, items: [] };
}

export function sections(items: CatalogItem[]): string[] {
  return [...new Set(items.map((i) => i.section))];
}

export function filterItems(items: CatalogItem[], section: string, q: string): CatalogItem[] {
  const s = q.trim().toLowerCase();
  return items.filter(
    (i) =>
      (!section || i.section === section) &&
      (!s || i.name.toLowerCase().includes(s) || i.code.toLowerCase().includes(s)),
  );
}

/**
 * Parse catalog rows from CSV (section,code,name,points — header optional,
 * comma/semicolon/tab separated) or JSON array of {section,code,name,points}.
 */
export function parseCatalogText(
  text: string,
): { ok: true; items: CatalogItem[] } | { ok: false; error: string } {
  const t = text.trim().replace(/^\uFEFF/, "");
  if (!t) return { ok: false, error: "لا توجد بيانات للاستيراد." };
  let rows: { section: unknown; code: unknown; name: unknown; points: unknown }[] = [];
  if (t.startsWith("[")) {
    try {
      rows = JSON.parse(t);
      if (!Array.isArray(rows)) throw 0;
    } catch {
      return { ok: false, error: "صيغة JSON غير صحيحة." };
    }
  } else {
    const lines = t.split(/\r?\n/).filter((l) => l.trim());
    for (const [i, line] of lines.entries()) {
      const cells = line.split(/[,;\t]/).map((c) => c.trim().replace(/^"|"$/g, ""));
      if (i === 0 && isNaN(Number(cells[3]))) continue; // header
      if (cells.length < 4) return { ok: false, error: `السطر ${i + 1}: يجب أن يحتوي 4 أعمدة (القسم، الرمز، البند، النقاط).` };
      rows.push({ section: cells[0], code: cells[1], name: cells[2], points: cells[3] });
    }
  }
  const items: CatalogItem[] = [];
  for (const [i, r] of rows.entries()) {
    const pts = Number(r.points);
    const name = String(r.name ?? "").trim();
    if (!name) return { ok: false, error: `الصف ${i + 1}: اسم البند فارغ.` };
    if (!isFinite(pts) || pts < 0 || r.points === "" || r.points == null)
      return { ok: false, error: `الصف ${i + 1} («${name}»): قيمة النقاط غير صالحة.` };
    items.push({
      id: `c${i}-${String(r.code ?? "")}`,
      section: String(r.section ?? "").trim() || "بدون قسم",
      code: String(r.code ?? "").trim(),
      name,
      points: pts,
    });
  }
  if (!items.length) return { ok: false, error: "لم يتم العثور على أي صف صالح." };
  return { ok: true, items };
}
