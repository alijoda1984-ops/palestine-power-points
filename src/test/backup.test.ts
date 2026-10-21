import { describe, it, expect, beforeEach, vi } from "vitest";
import { applyBackup, buildBackup, getProjects, parseBackup, saveProject, getCatalog, saveCatalog } from "@/lib/storage";
import type { Project } from "@/lib/types";

const proj = (id: string): Project => ({
  id, name: "مشروع " + id, location: "", ownerName: "", ownerPhone: "", electricianName: "", electricianPhone: "",
  date: "2026-10-20", mode: "goods", pricePerPoint: 25, agreementTerms: "", notes: "",
  lines: [{ id: "l1", catalogItemId: null, section: "s", code: "", name: "n", pointsPerItem: 2, quantity: 3, isTest: false }],
  createdAt: "", updatedAt: "",
});

describe("backup", () => {
  beforeEach(() => localStorage.clear());

  it("export includes saved projects (not 0)", () => {
    saveProject(proj("a")); saveProject(proj("b"));
    expect(buildBackup().projects).toHaveLength(2);
  });

  it("round-trips through JSON and restores after wipe", () => {
    saveProject(proj("a")); saveProject(proj("b"));
    const text = JSON.stringify(buildBackup());
    localStorage.clear();
    expect(getProjects()).toHaveLength(0);
    const r = parseBackup(text);
    expect(r.ok).toBe(true);
    if (r.ok) applyBackup(r.data, "merge");
    expect(getProjects().map((p) => p.id).sort()).toEqual(["a", "b"]);
    expect(getProjects()[0]?.lines[0]?.quantity).toBe(3);
  });

  it("merge keeps existing projects", () => {
    saveProject(proj("a"));
    const text = JSON.stringify(buildBackup());
    localStorage.clear(); saveProject(proj("c"));
    const r = parseBackup(text);
    if (r.ok) applyBackup(r.data, "merge");
    expect(getProjects()).toHaveLength(2);
  });

  it("corrupted storage reads as empty instead of crashing", () => {
    localStorage.setItem("kayla.projects.v1", '{"x":1}');
    expect(getProjects()).toEqual([]);
  });

  it("never overwrites unreadable existing projects on save", () => {
    localStorage.setItem("kayla.projects.v1", "broken-original");
    expect(() => saveProject(proj("a"))).toThrow();
    expect(localStorage.getItem("kayla.projects.v1")).toBe("broken-original");
  });

  it("replace restores full values and preserves independent catalogs", () => {
    saveProject(proj("a"));
    saveCatalog({ mode: "goods", isTest: false, sourceLabel: "test input", importedAt: null, items: [{ id: "g", section: "s", code: "test", name: "test", points: 2 }] });
    saveCatalog({ mode: "manufacturing", isTest: false, sourceLabel: "test input", importedAt: null, items: [{ id: "m", section: "s", code: "test", name: "test", points: 7 }] });
    const backup = buildBackup();
    saveProject(proj("c"));
    applyBackup(backup, "replace");
    expect(getProjects()).toEqual(backup.projects);
    expect(getCatalog("goods").items[0]?.points).toBe(2);
    expect(getCatalog("manufacturing").items[0]?.points).toBe(7);
  });

  it("rolls back projects when a catalog write fails", () => {
    saveProject(proj("a"));
    const backup = buildBackup();
    backup.catalogs.goods = { mode: "goods", isTest: false, sourceLabel: "test", importedAt: null, items: [] };
    saveProject(proj("c"));
    const before = localStorage.getItem("kayla.projects.v1");
    const original = Storage.prototype.setItem;
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === "kayla.catalog.goods.v1") throw new Error("quota");
      original.call(this, key, value);
    });
    try { expect(() => applyBackup(backup, "replace")).toThrow(); }
    finally { spy.mockRestore(); }
    expect(localStorage.getItem("kayla.projects.v1")).toBe(before);
  });
});
