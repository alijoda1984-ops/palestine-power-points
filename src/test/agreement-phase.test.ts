import { describe, expect, it } from "vitest";
import { ACTIVE_AGREEMENT_MODES, projectModeOptions } from "@/lib/agreement-phase";

describe("goods-only phase", () => {
  it("enables only the goods column for imports", () => {
    expect(ACTIVE_AGREEMENT_MODES).toEqual(["goods"]);
  });
  it("offers only goods for new goods projects", () => {
    expect(projectModeOptions("goods")).toEqual(["goods"]);
  });
  it("preserves manufacturing on existing projects without converting to goods", () => {
    expect(projectModeOptions("manufacturing")).toEqual(["manufacturing"]);
  });
});