import { describe, expect, it } from "vitest";
import { laborTotal, projectSummary, quickLabor, totalPoints } from "@/lib/calc";
import type { Project } from "@/lib/types";

const project: Project = {
  id: "field-test", name: "اختبار", location: "", ownerName: "", ownerPhone: "", electricianName: "", electricianPhone: "", date: "2026-10-24", mode: "goods", pricePerPoint: 20, agreementTerms: "", notes: "", createdAt: "", updatedAt: "",
  lines: [{ id: "line", catalogItemId: null, section: "", code: "", name: "بند اختباري", quantity: 3, pointsPerItem: 2.5, isTest: true }],
};

describe("field labor estimate", () => {
  it("multiplies points by the user price only", () => expect(quickLabor("7.5", "20")).toBe(150));
  it("accepts zero without treating it as an empty estimate", () => expect(quickLabor("0", "20")).toBe(0));
  it("does not estimate missing or invalid values", () => {
    for (const value of ["", " ", "-1", "abc", "Infinity"]) expect(quickLabor(value, "20")).toBeNull();
    expect(quickLabor("2", "-20")).toBeNull();
  });
  it("accepts Arabic decimal input", () => expect(quickLabor("٧٫٥", "٢٠")).toBe(150));
  it("rounds currency to two decimal places", () => expect(quickLabor("1.25", "2.5")).toBe(3.13));
});

describe("sharing", () => {
  it("summary generation leaves saved lines and mode unchanged", () => {
    const before = structuredClone(project);
    projectSummary(project);
    expect(project).toEqual(before);
    expect(totalPoints(project.lines)).toBe(7.5);
    expect(laborTotal(project.lines, project.pricePerPoint)).toBe(150);
  });
});