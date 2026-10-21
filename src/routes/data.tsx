import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WorkLineForm } from "@/components/WorkLineForm";
import { ErrorBox, Shell } from "@/components/Shell";
import { getCatalog, resetCatalog, saveCatalog, uid, useStore } from "@/lib/storage";
import { parseCatalogText } from "@/lib/catalog";
import { MODE_LABEL, RULESET_LABEL, type AgreementMode, type CatalogItem, type ProjectLine } from "@/lib/types";

export const Route = createFileRoute("/data")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
      <div className="mb-4 rounded-lg border-2 border-warning-foreground bg-warning p-3 text-warning-foreground">
        <b>مهم:</b> لا توجد قيم رسمية مضافة من طرف التطبيق. أدخل النقاط وتحقق منها من صور كتاب الكيلة المعتمدة. هذه الشاشة تخص «العمل مع بضاعة» فقط؛ بيانات المصانعة القديمة تبقى منفصلة ومحفوظة.
      </div>
      <CatalogPanel mode="goods" />

    </Shell>
  );
}

function CatalogPanel({ mode }: { mode: AgreementMode }) {
  const cat = useStore(() => getCatalog(mode));
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<CatalogItem[] | null>(null);

  const check = () => {
    setError(""); setPreview(null);
    if (!source.trim()) return setError("اكتب اسم المصدر (مثل: كتاب النقابة، السنة، الصفحات).");
    const r = parseCatalogText(text);
    if (!r.ok) return setError(r.error);
    setPreview(r.items);
  };

  const saveLine = (line: ProjectLine) => {
    if (!cat) return;
    if (!source.trim()) { setError("اكتب مصدر القيم قبل حفظ البند."); return; }
    const item: CatalogItem = { id: editing?.id ?? uid(), section: line.section, code: line.code, name: line.name, points: line.pointsPerItem };
    try {
      saveCatalog({ ...cat, sourceLabel: source.trim(), importedAt: new Date().toISOString(), items: editing ? cat.items.map((i) => i.id === editing.id ? item : i) : [...cat.items, item] });
      setEditing(null); setAdding(false); setError(""); toast.success("حُفظ بند الكتالوج");
    } catch (e) { setError((e as Error).message); }
  };
  return (
    <section className="mb-6 grid gap-3 border-t-2 py-4">
      <h2 className="text-lg font-bold">{MODE_LABEL[mode]}</h2>
      <p className="text-sm">{RULESET_LABEL[mode]}</p>
      {cat && (
        <p>الحالي: <b>{cat.items.length}</b> بند — {cat.sourceLabel} </p>
      )}
      <label className="font-bold">اسم المصدر الموثّق *<input className="field mt-1 font-normal" value={source} onChange={(e) => setSource(e.target.value)} /></label>
      <Button className="btn btn-primary" onClick={() => { setAdding(true); setEditing(null); }}>+ إضافة بند للكتالوج</Button>
      {(adding || editing) && <WorkLineForm key={editing?.id ?? "new"} submitLabel="حفظ بند الكتالوج" onAdd={saveLine} onCancel={() => { setAdding(false); setEditing(null); }} initial={editing ? { id: editing.id, catalogItemId: null, section: editing.section, code: editing.code, name: editing.name, pointsPerItem: editing.points, quantity: 1, isTest: false } : undefined} />}
      <input type="search" className="field" aria-label="بحث في الكتالوج" placeholder="بحث بالاسم أو الكود" value={query} onChange={(e) => setQuery(e.target.value)} />
      {cat?.items.length === 0 && <p className="py-3 text-muted-foreground">الكتالوج فارغ — بانتظار إدخال القيم من صور الكتاب المعتمدة.</p>}
      <ul className="divide-y">
        {cat?.items.filter((i) => `${i.name} ${i.code}`.toLowerCase().includes(query.trim().toLowerCase())).map((i) => <li key={i.id} className="flex items-center gap-2 py-3">
          <div className="min-w-0 flex-1"><b className="break-words">{i.name}</b><div className="text-sm">{i.code || "—"} · {i.points} نقطة</div></div>
          <Button variant="outline" size="icon" aria-label={`تعديل ${i.name}`} title="تعديل" onClick={() => { setEditing(i); setAdding(false); setSource(cat.sourceLabel); }}>✎</Button>
          <Button variant="outline" size="icon" aria-label={`حذف ${i.name}`} title="حذف" onClick={() => {
            if (!confirm(`حذف «${i.name}» من الكتالوج؟`)) return;
            try { saveCatalog({ ...cat, items: cat.items.filter((x) => x.id !== i.id) }); } catch (e) { setError((e as Error).message); }
          }}>✕</Button>
        </li>)}
      </ul>
      {error && <ErrorBox>{error}</ErrorBox>}
      <details><summary className="min-h-12 cursor-pointer py-3 font-bold">استيراد جدول CSV أو JSON</summary><div className="grid gap-3">
      <label className="font-bold">البيانات (CSV أو JSON)
        <textarea className="field mt-1 min-h-32 font-mono text-sm font-normal" dir="auto" value={text} onChange={(e) => setText(e.target.value)}
          placeholder={"القسم,الرمز,البند,النقاط\n..."} />
      </label>
      <input type="file" accept=".csv,.json,.txt,text/csv,application/json" className="field" aria-label="ملف البيانات"
        onChange={async (e) => { const f = e.target.files?.[0]; if (f) setText(await f.text()); }} />
      <p className="text-sm text-muted-foreground">الأعمدة بالترتيب: القسم، الرمز، البند، النقاط. الفاصل فاصلة أو فاصلة منقوطة. صف العناوين اختياري.</p>
      <Button className="btn btn-outline" onClick={check}>فحص البيانات</Button>
      {preview && (
        <div className="grid gap-2 rounded-lg bg-muted p-3">
          <p><b>{preview.length}</b> بند صالح. أول البنود: {preview.slice(0, 3).map((i) => `${i.name} (${i.points})`).join("، ")}</p>
          <Button className="btn btn-primary" onClick={() => {
            try {
              saveCatalog({ mode, isTest: false, sourceLabel: source.trim(), importedAt: new Date().toISOString(), items: preview });
              toast.success("تم استبدال جدول البيانات"); setPreview(null); setText("");
            } catch (e) { setError((e as Error).message); }
          }}>اعتماد واستبدال الجدول الحالي</Button>
        </div>
      )}
      {cat && cat.importedAt && (
        <Button className="btn btn-danger" onClick={() => { if (confirm("حذف البيانات المستوردة وإفراغ القائمة؟")) resetCatalog(mode); }}>حذف البيانات المستوردة</Button>
      )}
      </div></details>
      <p className="text-sm text-muted-foreground">تغيير الجدول لا يغيّر المشاريع المحفوظة؛ كل بند يحفظ قيمته وقت إضافته.</p>
    </section>
  );
}
