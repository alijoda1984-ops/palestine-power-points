export type AgreementMode = "goods" | "manufacturing";

export const MODE_LABEL: Record<AgreementMode, string> = {
  goods: "العمل مع بضاعة",
  manufacturing: "مصانعة",
};

/** Each mode has its own independent ruleset / catalog. They never share values. */
export const RULESET_LABEL: Record<AgreementMode, string> = {
  goods: "كتاب النقابة — عمود البضاعة (يُدخله المستخدم)",
  manufacturing: "كتاب النقابة — المصانعة (يُدخله المستخدم، منفصل)",
};

export const MODE_DESC: Record<AgreementMode, string> = {
  goods: "الكهربائي يورّد البضاعة (عمود البضاعة في كتاب النقابة). وحدات الإنارة غير مشمولة بمسؤولية الكهربائي عن البضاعة.",
  manufacturing: "صاحب العمل يورّد المواد ويدفع ثمنها. الكهربائي يتقاضى أجرة العمل فقط.",
};

export const VERIFY_NOTE = "تنبيه: يجب إدخال قيم النقاط والتحقق منها من كتاب النقابة قبل الاعتماد على أي تقدير حقيقي.";

export interface CatalogItem {
  id: string;
  section: string;
  code: string;
  name: string;
  points: number;
  unit?: string;
  sourceRow?: number;
  bookPage?: number | null;
  sourceNotes?: string;
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
