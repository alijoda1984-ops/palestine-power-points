import { beforeEach, describe, expect, it } from "vitest";
import { approvedWorkbookItems, mergeWorkbookItems } from "@/lib/approved-workbook";
import { applyBackup, buildBackup, getCatalog, parseBackup, saveCatalog } from "@/lib/storage";

describe("user-approved Excel", () => {
  beforeEach(() => localStorage.clear());
  it("uses each column independently: ground fence 4.5 goods, 3 manufacturing", () => {
    expect(approvedWorkbookItems("goods").find(i => i.name === "سياج إيرث أرضي")?.points).toBe(4.5);
    expect(approvedWorkbookItems("manufacturing").find(i => i.name === "سياج إيرث أرضي")?.points).toBe(3);
  });
  it("does not fill missing manufacturing from the goods value 2.5", () => {
    expect(approvedWorkbookItems("goods").find(i => i.name === "مفتاح مركزي نزول فقط")?.points).toBe(2.5);
    expect(approvedWorkbookItems("manufacturing").some(i => i.name === "مفتاح مركزي نزول فقط")).toBe(false);
  });
  it("excludes cables explicitly marked for final review in both modes", () => {
    for (const mode of ["goods", "manufacturing"] as const)
      expect(approvedWorkbookItems(mode).some(i => i.name === "كابل 1.5*3")).toBe(false);
  });
  it("never invents codes missing from the workbook", () => {
    expect(approvedWorkbookItems("goods").length).toBeGreaterThan(0);
    expect(approvedWorkbookItems("goods").every(i => i.code === "")).toBe(true);
  });
  it("merges without deleting existing rows or duplicating repeated imports", () => {
    const existing = { id: "user-row", section: "user", name: "user", code: "", points: 7 };
    const once = mergeWorkbookItems([existing], "goods");
    expect(once.find(i => i.id === "user-row")).toEqual(existing);
    expect(mergeWorkbookItems(once, "goods")).toEqual(once);
  });
  it("backs up both independent catalogs including source page and unit", () => {
    for (const mode of ["goods", "manufacturing"] as const)
      saveCatalog({ mode, isTest: false, sourceLabel: "approved Excel", importedAt: null, items: approvedWorkbookItems(mode) });
    const result = parseBackup(JSON.stringify(buildBackup()));
    expect(result.ok).toBe(true);
    localStorage.clear();
    if (!result.ok) throw new Error(result.error);
    applyBackup(result.data, "replace");
    for (const mode of ["goods", "manufacturing"] as const)
      expect(getCatalog(mode).items).toEqual(approvedWorkbookItems(mode));
  });
});