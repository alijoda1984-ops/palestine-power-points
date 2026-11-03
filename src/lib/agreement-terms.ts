import type { AgreementMode } from "./types";

/** User-approved wording only; never infer legal provisions or payment rates. */
export const APPROVED_GOODS_TERMS = [
  "نطاق العمل وتوريد المواد: يلتزم الكهربائي بكافة التمديدات والتأسيسات وفق الأصول الهندسية، مع توريد المواد الأساسية المعتمدة (المواسير، العلب، الأسلاك النحاسية، القواطع، البرايز والمفاتيح).",
  "استثناء وحدات الإنارة: وحدات الإنارة (ثريات، سبوتات، لدات، كشافات) والأجهزة يؤمنها صاحب العمل، ودور الكهربائي يقتصر على التركيب والتوصيل وفق الكيلة.",
  "الدفعة النهائية: تُصرف الدفعة النهائية المتبقية بعد إجراء الكيلة الميدانية الفعلية للنقاط واجتياز الفحص الفني بنجاح من قبل شركة الكهرباء أو أي مزود للطاقة حسب المنطقة والتسليم النهائي.",
  "الحساب والأعمال الإضافية: الحساب بالنقاط الفعلية المنفذة × سعر النقطة، وأي تعديل أو تكسير بعد التأسيس يحاسب عليه بشكل منفصل.",
].join("\n");

/** The template is opt-in, goods-only, and must not overwrite existing wording. */
export function approvedAgreementTerms(mode: AgreementMode, current: string): string {
  return mode === "goods" && !current.trim() ? APPROVED_GOODS_TERMS : current;
}