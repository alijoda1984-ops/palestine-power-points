import { describe, expect, it } from "vitest";
import { groupBySection, laborTotal, totalPoints } from "@/lib/calc";
import { parseCatalogText, defaultCatalog } from "@/lib/catalog";
import { parseBackup } from "@/lib/storage";
import type { ProjectLine } from "@/lib/types";

const L = (section: string, pts: number, qty: number): ProjectLine => ({
  id: Math.random().toString(), catalogItemId: null, section, code: "", name: "x", pointsPerItem: pts, quantity: qty, isTest: false,
});

describe("calc", () => {
  const lines = [L("a", 2, 3), L("a", 0.5, 4), L("b", 1.5, 2)];
  it("totals points as qty × points", () => expect(totalPoints(lines)).toBe(11));
  it("subtotals per section", () => expect(groupBySection(lines).map((g) => g.subtotal)).toEqual([8, 3]));
  it("labor = total points × price per point", () => expect(laborTotal(lines, 25)).toBe(275));
});

describe("rulesets", () => {
  it("both catalogs start empty — no invented book values", () => {
    expect(defaultCatalog("manufacturing").items).toHaveLength(0);
    expect(defaultCatalog("goods").items).toHaveLength(0);
  });
});

describe("catalog import", () => {
  it("parses CSV with header", () => {
    const r = parseCatalogText("القسم,الرمز,البند,النقاط\nإنارة,A1,نقطة إنارة,1.5");
    expect(r.ok && r.items[0]?.points).toBe(1.5);
  });
  it("rejects bad points", () => expect(parseCatalogText("s,c,n,abc").ok).toBe(false));
});

describe("backup", () => {
  it("rejects invalid json", () => expect(parseBackup("{oops").ok).toBe(false));
  it("rejects foreign files", () => expect(parseBackup('{"a":1}').ok).toBe(false));
});
