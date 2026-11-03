import type { AgreementMode } from "./types";

/** User-approved wording only; never infer legal provisions or payment rates. */
export const APPROVED_PAYMENT_PERCENTAGES = [30, 40, 20] as const;
export const APPROVED_WARRANTY_YEARS = 1;
export const APPROVED_GOODS_TERMS = [
  "نطاق العمل وتوريد المواد: يلتزم الكهربائي بكامل التأسيسات والتمديدات الكهربائية الداخلية وفق الأصول الفنية، مع توريد المواد الأساسية المعتمدة (المواسير، العلب، الأسلاك النحاسية، القواطع، البرايز والمفاتيح القياسية).",
  "استثناء وحدات الإنارة: وحدات الإنارة بجميع أنواعها (ثريات، سبوتات، أشرطة LED، كشافات) والأجهزة يؤمّنها صاحب العمل على حسابه، ويقتصر دور الكهربائي على التوصيل والتركيب واحتسابها ضمن نقاط الكيلة.",
  `الدفعة الأولى (${APPROVED_PAYMENT_PERCENTAGES[0]}%): دفعة مقدمة عند بدء أعمال التكسير، وتثبيت العلب، ومد المواسير في الأسقف والجدران.`,
  `الدفعة الثانية (${APPROVED_PAYMENT_PERCENTAGES[1]}%): بعد سحب الأسلاك وتجميع وتوزيع لوحة القواطع الرئيسية والفرعية وفحص خطوط التغذية.`,
  `الدفعة الثالثة (${APPROVED_PAYMENT_PERCENTAGES[2]}%): عند تركيب البرايز والمفاتيح والتشغيل التجريبي الداخلي.`,
  "الدفعة النهائية (المتبقي): تُصرف بعد الكيلة الميدانية الفعلية لعدد النقاط واجتياز الفحص الفني بنجاح من قِبل شركة الكهرباء أو مزود الطاقة المعني في المنطقة والتسليم النهائي.",
  "الكيلة والأعمال الإضافية: الحساب بالنقاط الفعلية المنفذة × سعر النقطة، وأي تعديل أو إلغاء أو تكسير إضافي بعد التأسيس يُحاسب عليه بشكل منفصل.",
  `الضمان: يضمن الكهربائي جودة التوصيلات وسلامتها من أي أخطاء فنية لمدة ${APPROVED_WARRANTY_YEARS === 1 ? "سنة" : `${APPROVED_WARRANTY_YEARS} سنوات`} من تاريخ إطلاق التيار.`,
].join("\n");

/** The template is opt-in, goods-only, and must not overwrite existing wording. */
export function approvedAgreementTerms(mode: AgreementMode, current: string): string {
  return mode === "goods" && !current.trim() ? APPROVED_GOODS_TERMS : current;
}