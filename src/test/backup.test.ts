import { describe, it, expect, beforeEach } from "vitest";
import { applyBackup, buildBackup, getProjects, parseBackup, saveProject } from "@/lib/storage";
import type { Project } from "@/lib/types";
import { approvedAgreementTerms } from "@/lib/agreement-terms";

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

  it("preserves saved approved terms and legacy manufacturing through JSON merge", () => {
    const goods = { ...proj("goods"), agreementTerms: approvedAgreementTerms("goods", "") };
    const legacy = { ...proj("legacy"), mode: "manufacturing" as const, agreementTerms: "شروط سابقة" };
    saveProject(goods); saveProject(legacy);
    const before = getProjects();
    const parsed = parseBackup(JSON.stringify(buildBackup()));
    if (!parsed.ok) throw new Error(parsed.error);
    applyBackup(parsed.data, "merge");
    expect(getProjects()).toEqual(before);
    expect(getProjects().find(p => p.id === "goods")?.agreementTerms).toBe(goods.agreementTerms);
    expect(getProjects().find(p => p.id === "legacy")?.mode).toBe("manufacturing");
  });

  it("corrupted storage reads as empty instead of crashing", () => {
    localStorage.setItem("kayla.projects.v1", '{"x":1}');
    expect(getProjects()).toEqual([]);
  });
});
