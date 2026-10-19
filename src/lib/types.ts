export type AgreementMode = "goods" | "manufacturing";

export const MODE_LABEL: Record<AgreementMode, string> = {
  goods: "العمل مع بضاعة",
  manufacturing: "مصانعة",
};

/** Each mode has its own independent ruleset / catalog. They never share values. */
export const RULESET_LABEL: Record<AgreementMode, string> = {
  goods: "كتاب النقابة 2018 — عمود النقاط مع البضاعة",
  manufacturing: "كتاب المصانعة 2025 (منفصل)",
};

export interface CatalogItem {
  id: string;
  section: string;
  code: string;
  name: string;
  points: number;
}

export interface Catalog {
  mode: AgreementMode;
  /** true = sample rows for testing only, NOT official values */
  isTest: boolean;
  sourceLabel: string;
  importedAt: string | null;
  items: CatalogItem[];
}

export interface ProjectLine {
  id: string;
  catalogItemId: string | null; // null = manual line
  section: string;
  code: string;
  name: string;
  pointsPerItem: number;
  quantity: number;
  /** value came from test/sample data */
  isTest: boolean;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  ownerName: string;
  ownerPhone: string;
  electricianName: string;
  electricianPhone: string;
  date: string; // yyyy-mm-dd
  mode: AgreementMode;
  pricePerPoint: number;
  agreementTerms: string;
  notes: string;
  lines: ProjectLine[];
  createdAt: string;
  updatedAt: string;
}
