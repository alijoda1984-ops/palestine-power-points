import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ErrorBox, Shell } from "@/components/Shell";
import { getCatalog, resetCatalog, saveCatalog, useStore } from "@/lib/storage";
import { parseCatalogText } from "@/lib/catalog";
import { approvedWorkbookItems, mergeWorkbookItems, WORKBOOK_SOURCE } from "@/lib/approved-workbook";
import { Button } from "@/components/ui/button";
import { MODE_LABEL, RULESET_LABEL, type AgreementMode, type CatalogItem } from "@/lib/types";

export const Route = createFileRoute("/data")({
  head: () => ({
    meta: [
      { title: "إدارة بيانات الكتب — كيلة الأعمال الكهربائية" },
      { name: "description", content: "استيراد قيم النقاط الموثّقة لكل نوع اتفاق." },
      { property: "og:title", content: "إدارة بيانات الكتب" },
      { property: "og:description", content: "استيراد قيم النقاط الموثّقة." },
    ],
  }),
  component: DataPage,
});

function DataPage() {
  return (
    <Shell title="إدارة بيانات الكتب">
      <div className="mb-4 rounded-xl border-2 border-warning-foreground bg-warning p-3 text-warning-foreground">
        <b>مهم:</b> الإكسل الذي أكّدت أنه من صور الكتاب متاح أدناه. تُضاف القيم الصريحة فقط؛ تُستبعد البنود المعلّمة للمراجعة والقيم غير الواضحة، ولا تُستكمل الخانات الناقصة. لكل نوع اتفاق قائمة مستقلة تماماً، ولا تُنقل القيم بينهما. لا يتضمن الإكسل رموز بنود، لذلك تبقى الرموز فارغة.
      </div>
      <CatalogPanel mode="goods" />
      <CatalogPanel mode="manufacturing" />
    </Shell>
  );
}

function CatalogPanel({ mode }: { mode: AgreementMode }) {
  const cat = useStore(() => getCatalog(mode));
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<CatalogItem[] | null>(null);
  const approved = approvedWorkbookItems(mode);

  const check = () => {
    setError(""); setPreview(null);
    if (!source.trim()) return setError("اكتب اسم المصدر (مثل: كتاب النقابة، السنة، الصفحات).");
    const r = parseCatalogText(text);
    if (!r.ok) return setError(r.error);
    setPreview(r.items);
  };

  return (
    <section className="mb-6 grid gap-2 rounded-xl border-2 border-foreground p-4">
      <h2 className="text-lg font-bold">{MODE_LABEL[mode]}</h2>
      <p className="text-sm">{RULESET_LABEL[mode]}</p>
      {cat && (
        <p>الحالي: <b>{cat.items.length}</b> بند — {cat.sourceLabel} </p>
      )}
      <p className="text-sm">الإكسل المعتمد: {approved.length} بند صالح لهذا النمط من أصل 241. بقية البنود مؤجّلة للمراجعة أو لعدم وضوح القيمة.</p>
      <Button className="min-h-12 h-auto whitespace-normal" disabled={!cat} onClick={() => {
        if (!cat) return;
        try {
          const current = getCatalog(mode);
          const items = mergeWorkbookItems(current.items, mode);
          saveCatalog({ ...current, items, isTest: false, sourceLabel: current.items.length ? `${current.sourceLabel}؛ ${WORKBOOK_SOURCE}` : WORKBOOK_SOURCE, importedAt: new Date().toISOString() });
          toast.success(`أُضيف ${items.length - current.items.length} بند إلى «${MODE_LABEL[mode]}»؛ حُفظت البنود السابقة`);
        } catch (e) { setError((e as Error).message); }
      }}>إضافة قيم الإكسل — {MODE_LABEL[mode]}</Button>
      <label className="font-bold">اسم المصدر الموثّق *<input className="field mt-1 font-normal" value={source} onChange={(e) => setSource(e.target.value)} /></label>
      <label className="font-bold">البيانات (CSV أو JSON)
        <textarea className="field mt-1 min-h-32 font-mono text-sm font-normal" dir="auto" value={text} onChange={(e) => setText(e.target.value)}
          placeholder={"القسم,الرمز,البند,النقاط\n..."} />
      </label>
      <input type="file" accept=".csv,.json,.txt,text/csv,application/json" className="field" aria-label="ملف البيانات"
        onChange={async (e) => { const f = e.target.files?.[0]; if (f) setText(await f.text()); }} />
      <p className="text-sm text-muted-foreground">الأعمدة بالترتيب: القسم، الرمز، البند، النقاط. الفاصل فاصلة أو فاصلة منقوطة. صف العناوين اختياري.</p>
      {error && <ErrorBox>{error}</ErrorBox>}
      <button className="btn btn-outline" onClick={check}>فحص البيانات</button>
      {preview && (
        <div className="grid gap-2 rounded-lg bg-muted p-3">
          <p><b>{preview.length}</b> بند صالح. أول البنود: {preview.slice(0, 3).map((i) => `${i.name} (${i.points})`).join("، ")}</p>
          <button className="btn btn-primary" onClick={() => {
            try {
              saveCatalog({ mode, isTest: false, sourceLabel: source.trim(), importedAt: new Date().toISOString(), items: preview });
              toast.success("تم استبدال جدول البيانات"); setPreview(null); setText("");
            } catch (e) { setError((e as Error).message); }
          }}>اعتماد واستبدال الجدول الحالي</button>
        </div>
      )}
      {cat && cat.importedAt && (
        <button className="btn btn-danger" onClick={() => { if (confirm("حذف البيانات المستوردة وإفراغ القائمة؟")) resetCatalog(mode); }}>حذف البيانات المستوردة</button>
      )}
      <p className="text-sm text-muted-foreground">تغيير الجدول لا يغيّر المشاريع المحفوظة؛ كل بند يحفظ قيمته وقت إضافته.</p>
    </section>
  );
}
