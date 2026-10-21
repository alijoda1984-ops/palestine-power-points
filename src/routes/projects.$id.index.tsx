import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WorkLineForm as ManualLine } from "@/components/WorkLineForm";
import { ErrorBox, Shell, TestBadge } from "@/components/Shell";
import { deleteProject, getCatalog, getProject, saveProject, uid, useStore } from "@/lib/storage";
import { filterItems, sections } from "@/lib/catalog";
import { fmt, groupBySection, laborTotal, lineTotal, totalPoints } from "@/lib/calc";
import { MODE_DESC, MODE_LABEL, RULESET_LABEL, VERIFY_NOTE, type CatalogItem, type Project, type ProjectLine } from "@/lib/types";

export const Route = createFileRoute("/projects/$id/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "كيلة المشروع — كيلة الأعمال الكهربائية" },
      { name: "description", content: "جدول حساب النقاط وأجرة العمل للمشروع." },
      { property: "og:title", content: "كيلة المشروع" },
      { property: "og:description", content: "جدول حساب النقاط وأجرة العمل للمشروع." },
    ],
  }),
  component: Editor,
});

const num = (s: string) => Number(s.replace(",", "."));

function Editor() {
  const { id } = Route.useParams();
  const p = useStore(() => getProject(id));
  if (p === undefined) return <Shell title="المشروع"><p>جارِ التحميل…</p></Shell>;
  if (!p) return <Shell title="المشروع"><ErrorBox>المشروع غير موجود على هذا الجهاز.</ErrorBox></Shell>;
  return <EditorInner project={p} />;
}

function EditorInner({ project: p }: { project: Project }) {
  const nav = useNavigate();
  const catalog = useStore(() => getCatalog(p.mode));
  const [section, setSection] = useState("");
  const [q, setQ] = useState("");
  const [qtys, setQtys] = useState<Record<string, string>>({});
  const [showManual, setShowManual] = useState(false);
  const [lineSearch, setLineSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  const update = (lines: ProjectLine[], extra: Partial<Project> = {}) => {
    try { saveProject({ ...p, ...extra, lines }); return true; } catch (e) { toast.error((e as Error).message); return false; }
  };

  const addItem = (it: CatalogItem) => {
    const raw = qtys[it.id] ?? "1";
    const qn = num(raw);
    if (!isFinite(qn) || qn <= 0) { toast.error("أدخل كمية أكبر من صفر"); return; }
    const existing = p.lines.find((l) => l.catalogItemId === it.id);
    const saved = existing ? update(p.lines.map((l) => l === existing ? { ...l, quantity: l.quantity + qn } : l));
     : update([...p.lines, { id: uid(), catalogItemId: it.id, section: it.section, code: it.code, name: it.name, pointsPerItem: it.points, quantity: qn, isTest: !!catalog?.isTest }]);
    if (!saved) return;
    setQtys((x) => ({ ...x, [it.id]: "1" }));
    toast.success(`أُضيف: ${it.name} × ${qn}`);
  };

  const items = useMemo(() => catalog ? filterItems(catalog.items, section, q) : [], [catalog, section, q]);
  const groups = groupBySection(p.lines.filter((l) => `${l.name} ${l.code}`.toLowerCase().includes(lineSearch.trim().toLowerCase())));
  const total = totalPoints(p.lines);
  const labor = laborTotal(p.lines, p.pricePerPoint);
  const hasTest = p.lines.some((l) => l.isTest);

  return (
    <Shell title={p.name}>
      <section className="mb-4 border-b-2 pb-4">
        <div className="rounded-lg bg-primary p-2 text-center text-lg font-bold text-primary-foreground">نوع الاتفاق: {MODE_LABEL[p.mode]}</div>
        <p className="mt-1 text-sm">{MODE_DESC[p.mode]}</p>
        <div className="text-sm text-muted-foreground">{[p.location, p.ownerName, p.date].filter(Boolean).join(" · ")}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/projects/$id/edit" params={{ id: p.id }} className="btn btn-outline">تعديل البيانات</Link>
          <Link to="/projects/$id/report" params={{ id: p.id }} className="btn btn-outline">التقرير / طباعة</Link>
          <Link to="/projects/$id/agreement" params={{ id: p.id }} className="btn btn-outline">الاتفاقية</Link>
        </div>
      </section>

      <p className="mb-4 rounded-lg border-2 border-dashed p-2 text-sm font-bold">{VERIFY_NOTE}</p>

      {/* ADD ITEMS */}
      <section className="mb-6 border-y-2 border-foreground py-4">
        <h2 className="mb-1 text-lg font-bold">إضافة بنود</h2>
        <p className="mb-2 text-sm">المصدر: {RULESET_LABEL[p.mode]}</p>
        {catalog?.isTest && <div className="mb-2"><TestBadge /></div>}
        {catalog && catalog.items.length === 0 ? (
          <ErrorBox>
            قائمة بنود «{MODE_LABEL[p.mode]}» فارغة. لم تُدخَل أي قيم من كتاب النقابة بعد. أدخلها من <Link to="/data" className="underline">إدارة البيانات</Link>، أو أضف بنداً يدوياً أدناه.
          </ErrorBox>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              <select className="field" value={section} onChange={(e) => setSection(e.target.value)} aria-label="القسم">
                <option value="">كل الأقسام</option>
                {catalog && sections(catalog.items).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input className="field" type="search" placeholder="بحث بالبند أو الرمز" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <ul className="mt-3 max-h-96 divide-y overflow-y-auto rounded-lg border-2">
              {items.length === 0 && <li className="p-3 text-muted-foreground">لا نتائج.</li>}
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-2 p-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold">{it.name}</div>
                    <div className="text-sm text-muted-foreground">{it.code} · {it.section} · {fmt(it.points)} نقطة</div>
                  </div>
                  <input className="field w-20 text-center" inputMode="decimal" placeholder="1" aria-label={`كمية ${it.name}`}
                    value={qtys[it.id] ?? ""} onChange={(e) => setQtys((x) => ({ ...x, [it.id]: e.target.value }))} />
                  <Button className="btn btn-primary" onClick={() => addItem(it)}>أضف</Button>
                </li>
              ))}
            </ul>
          </>
        )}
        <Button className="btn btn-outline mt-3 w-full" onClick={() => setShowManual((v) => !v)}>{showManual ? "إخفاء" : "+ إضافة بند يدوي"}</Button>
        {showManual && <ManualLine onAdd={(l) => { if (update([...p.lines, l])) { setShowManual(false); toast.success("أُضيف البند"); } }} />}
      </section>

      {/* TABLE */}
      <h2 className="mb-2 text-lg font-bold">بنود المشروع</h2>
      <input type="search" className="field mb-3" aria-label="بحث في بنود المشروع" placeholder="بحث في بنود المشروع أو الكود" value={lineSearch} onChange={(e) => setLineSearch(e.target.value)} />
      {hasTest && <div className="mb-2"><TestBadge>يحتوي المشروع على قيم تجريبية — ليست رسمية</TestBadge></div>}
      {p.lines.length === 0 ? <p className="text-muted-foreground">لم تُضَف بنود بعد.</p> : (
        <div className="work-table">
          <table className="w-full border-collapse text-right">
            <thead>
              <tr className="border-b-2 border-foreground bg-muted">
                <th className="p-2">البند / الرمز</th><th className="p-2">الكمية</th><th className="p-2">نقاط/بند</th><th className="p-2">المجموع</th><th className="p-2"><span className="sr-only">إجراءات</span></th>
              </tr>
            </thead>
            {groups.map((g) => (
              <tbody key={g.section}>
                <tr><td colSpan={5} className="bg-secondary p-2 font-bold">{g.section}</td></tr>
                {g.lines.map((l) => editing === l.id ? (
                  <tr key={l.id}><td colSpan={5} className="p-1">
                    <ManualLine initial={l} submitLabel="حفظ التعديل" onCancel={() => setEditing(null)} onAdd={(nl) => { if (update(p.lines.map((x) => x.id === l.id ? nl : x))) { setEditing(null); toast.success("تم حفظ البند"); } }} />
                  </td></tr>
                ) : (
                  <tr key={l.id} className="work-row border-b align-middle">
                    <td className="p-2"><div className="font-bold">{l.name}</div><div className="text-sm text-muted-foreground">الرمز: {l.code || "—"}{!l.catalogItemId ? " · يدوي" : ""}</div></td>
                    <td className="p-1" data-label="الكمية"><QtyInput key={`${l.id}-${l.quantity}`} value={l.quantity} onChange={(v) => update(p.lines.map((x) => x.id === l.id ? { ...x, quantity: v } : x))} /></td>
                    <td className="p-2" data-label="نقاط لكل وحدة">{fmt(l.pointsPerItem)}</td>
                    <td className="p-2 font-bold" data-label="مجموع النقاط">{fmt(lineTotal(l))}</td>
                    <td className="p-1"><div className="flex gap-2 sm:flex-col">
                      <Button className="btn btn-outline min-h-11 px-3" title="تعديل البند" aria-label={`تعديل ${l.name}`} onClick={() => setEditing(l.id)}>✎</Button>
                      <Button className="btn btn-danger min-h-11 px-3" title="حذف البند" aria-label={`حذف ${l.name}`} onClick={() => { if (confirm(`حذف «${l.name}»؟`)) update(p.lines.filter((x) => x.id !== l.id)); }}>✕</Button>
                    </div></td>
                  </tr>
                ))}
                <tr className="border-b-2 border-foreground"><td colSpan={3} className="p-2 font-bold">مجموع {g.section}</td><td className="p-2 font-bold" colSpan={2}>{fmt(g.subtotal)}</td></tr>
              </tbody>
            ))}
          </table>
        </div>
      )}

      <Button className="btn btn-danger mt-8 w-full" onClick={() => { if (confirm("حذف المشروع نهائياً من هذا الجهاز؟")) { deleteProject(p.id); toast.success("تم حذف المشروع"); nav({ to: "/projects" }); } }}>حذف المشروع</Button>

      {/* STICKY TOTALS */}
      <div className="no-print fixed inset-x-0 bottom-0 z-10 border-t-2 border-foreground bg-background" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2 px-4 py-2 text-center">
          <div><div className="text-xs">مجموع النقاط</div><div className="text-lg font-bold" data-testid="total-points">{fmt(total)}</div></div>
          <div><div className="text-xs">سعر النقطة</div><div className="text-lg font-bold">{fmt(p.pricePerPoint)}</div></div>
          <div><div className="text-xs">أجرة العمل (شيكل)</div><div className="text-lg font-bold text-primary" data-testid="labor-total">{fmt(labor)}</div></div>
        </div>
      </div>
    </Shell>
  );
}

function QtyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [s, setS] = useState(String(value));
  const [bad, setBad] = useState(false);
  return (
    <input className="field w-20 text-center" inputMode="decimal" value={s} aria-invalid={bad} aria-label="الكمية"
      onChange={(e) => setS(e.target.value)}
      onBlur={() => { const n = num(s); if (!isFinite(n) || n <= 0) { setBad(true); toast.error("الكمية يجب أن تكون أكبر من صفر"); setS(String(value)); setBad(false); return; } if (n !== value) onChange(n); }} />
  );
}
