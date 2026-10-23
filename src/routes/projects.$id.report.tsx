import { createFileRoute } from "@tanstack/react-router";
import { getProject, useStore } from "@/lib/storage";
import { fmt, groupBySection, laborTotal, lineTotal, totalPoints } from "@/lib/calc";
import { MODE_DESC, MODE_LABEL, RULESET_LABEL, VERIFY_NOTE } from "@/lib/types";
import { Parties, PrintBar } from "@/components/PrintHeader";
import { TestBadge } from "@/components/Shell";

export const Route = createFileRoute("/projects/$id/report")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "تقرير المشروع — كيلة الأعمال الكهربائية" },
      { name: "description", content: "تقرير مفصّل قابل للطباعة لنقاط المشروع وأجرة العمل." },
      { property: "og:title", content: "تقرير المشروع — كيلة الأعمال الكهربائية" },
      { property: "og:description", content: "تقرير مفصّل قابل للطباعة." },
    ],
  }),
  component: Report,
});

function Report() {
  const { id } = Route.useParams();
  const p = useStore(() => getProject(id));
  if (p === undefined) return <p className="p-4">جارِ التحميل…</p>;
  if (!p) return <p className="p-4 font-bold">المشروع غير موجود.</p>;
  const groups = groupBySection(p.lines);
  const hasTest = p.lines.some((l) => l.isTest);
  return (
    <div className="mx-auto max-w-3xl">
      <PrintBar p={p} />
      <article className="p-4">
        <h1 className="mb-1 text-center text-2xl font-bold">كيلة الأعمال الكهربائية</h1>
        <div className="mb-4 rounded border-2 border-foreground p-2 text-center"><div className="text-lg font-bold">نوع الاتفاق: {MODE_LABEL[p.mode]}</div><div className="text-sm">{MODE_DESC[p.mode]}</div><div className="text-sm">{RULESET_LABEL[p.mode]}</div></div>
        {hasTest && <p className="mb-3 text-center"><TestBadge>تحذير: يحتوي التقرير على قيم تجريبية — ليست رسمية</TestBadge></p>}
        <Parties p={p} />
        <table className="w-full border-collapse text-right">
          <thead><tr className="bg-muted"><th className="border p-1.5">الرمز</th><th className="border p-1.5">البند</th><th className="border p-1.5">الكمية</th><th className="border p-1.5">نقاط/بند</th><th className="border p-1.5">مجموع النقاط</th></tr></thead>
          {groups.map((g) => (
            <tbody key={g.section}>
              <tr><td colSpan={5} className="border bg-secondary p-1.5 font-bold">{g.section}</td></tr>
              {g.lines.map((l) => (
                <tr key={l.id}><td className="border p-1.5">{l.code || "—"}</td><td className="border p-1.5">{l.name}{l.isTest ? " *" : ""}</td><td className="border p-1.5">{fmt(l.quantity)}</td><td className="border p-1.5">{fmt(l.pointsPerItem)}</td><td className="border p-1.5">{fmt(lineTotal(l))}</td></tr>
              ))}
              <tr className="font-bold"><td colSpan={4} className="border p-1.5">مجموع القسم</td><td className="border p-1.5">{fmt(g.subtotal)}</td></tr>
            </tbody>
          ))}
          <tfoot className="font-bold">
            <tr><td colSpan={4} className="border p-1.5">مجموع النقاط</td><td className="border p-1.5">{fmt(totalPoints(p.lines))}</td></tr>
            <tr><td colSpan={4} className="border p-1.5">سعر النقطة (شيكل)</td><td className="border p-1.5">{fmt(p.pricePerPoint)}</td></tr>
            <tr className="text-lg"><td colSpan={4} className="border p-1.5">أجرة العمل (شيكل)</td><td className="border p-1.5">{fmt(laborTotal(p.lines, p.pricePerPoint))}</td></tr>
          </tfoot>
        </table>
        {hasTest && <p className="mt-2 text-sm">* قيمة تجريبية.</p>}
        <p className="mt-2 text-sm">{VERIFY_NOTE}</p>
        <p className="mt-1 text-sm">هذا التقرير مستند عادي قابل للتعديل وليس محمياً من التلاعب.</p>
        <p className="mt-1 text-sm">المبلغ أعلاه أجرة عمل فقط ولا يشمل أي مواد أو بضاعة.</p>
        {p.notes && <p className="mt-3 whitespace-pre-wrap"><b>ملاحظات:</b> {p.notes}</p>}
      </article>
    </div>
  );
}
