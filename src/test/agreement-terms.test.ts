import { describe, expect, it } from "vitest";
import { APPROVED_GOODS_TERMS, approvedAgreementTerms } from "@/lib/agreement-terms";

describe("approved agreement insertion", () => {
  it("inserts the approved template only into an empty goods agreement", () => {
    expect(approvedAgreementTerms("goods", "")).toBe(APPROVED_GOODS_TERMS);
    expect(APPROVED_GOODS_TERMS.length).toBeGreaterThan(0);
  });
  it("does not overwrite the customer's existing terms", () => {
    expect(approvedAgreementTerms("goods", "شرط خاص بالزبون")).toBe("شرط خاص بالزبون");
  });
  it("never applies the goods template to deferred manufacturing agreements", () => {
    expect(approvedAgreementTerms("manufacturing", "")).toBe("");
    expect(approvedAgreementTerms("manufacturing", "شروط سابقة")).toBe("شروط سابقة");
  });
  it("repeated insertion leaves the agreement unchanged", () => {
    const terms = approvedAgreementTerms("goods", "");
    expect(approvedAgreementTerms("goods", terms)).toBe(terms);
  });
});