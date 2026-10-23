import type { AgreementMode } from "./types";

export const ACTIVE_AGREEMENT_MODES: readonly AgreementMode[] = ["goods"];

/** Legacy agreements retain their own mode; never convert their saved values. */
export function projectModeOptions(initialMode: AgreementMode): readonly AgreementMode[] {
  return initialMode === "manufacturing" ? ["manufacturing"] : ACTIVE_AGREEMENT_MODES;
}