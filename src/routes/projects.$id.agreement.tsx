import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getProject, saveProject, useStore } from "@/lib/storage";
import { fmt, laborTotal, totalPoints } from "@/lib/calc";
import { MODE_LABEL } from "@/lib/types";
import { Parties, PrintBar } from "@/components/PrintHeader";
import { TestBadge } from "@/components/Shell";

export const Route = createFileRoute("/projects/$id/agreement")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "اتفاقية عمل — كيلة الأعمال الكهربائية" },
      { name: "description", content: "اتفاقية عمل كهربائي قابلة للطباعة." },
      { property: "og:title", content: "اتفاقية عمل — كيلة الأعمال الكهربائية" },
      { property: "og:description", content: "اتفاقية عمل كهربائي قابلة للطباعة." },
    ],
  }),
  component: Agreement,
});

function Agreement() {
  const { id } = Route.useParams();
  const p = useStore(() => getProject(id));
  const [terms, setTerms] = useState("");
  useEffect(() => { if (p) setTerms(p.agreementTerms); }, [p?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (p === undefined) return <p className="p-4">جارِ التحميل…</p>;
  if (!p) return <p className="p-4 font-bold">المشروع غير موجود.</p>;
  const hasTest = p.lines.some((l) => l.isTest);
  return (
    <div className="mx-auto max-w-3xl">
      <PrintBar p={p} />
      <div className="no-print grid gap-2 p-4">
        <label className="font-bold" htmlFor="terms">بنود الاتفاق</label>
        <p className="text-sm text-muted-foreground">لا يضيف التطبيق أي بنود قانونية جاهزة. اكتب البنود المتفق عليها بين الطرفين، بنداً في كل سطر.</p>
        <textarea id="terms" className="field min-h-40" value={terms} onChange={(e) => setTerms(e.target.value)} />
        <button className="btn btn-outline" onClick={() => { try { saveProject({ ...p, agreementTerms: terms }); toast.success("حُفظت البنود"); } catch (e) { toast.error((e as Error).message); } }}>حفظ البنود</button>
      </div>
      <article className="p-4">
        <h1 className="mb-1 text-center text-2xl font-bold">اتفاقية عمل كهربائي</h1>
        <p className="mb-4 text-center">نوع الاتفاق: {MODE_LABEL[p.mode]}</p>
        {hasTest && <p className="mb-3 text-center"><TestBadge>تحذير: الحساب مبني على قيم تجريبية — ليست رسمية</TestBadge></p>}
        <Parties p={p} />
        <table className="mb-4 w-full border-collapse text-right font-bold">
          <tbody>
            <tr><th className="w-48 border bg-muted p-1.5 text-right">مجموع النقاط</th><td className="border p-1.5">{fmt(totalPoints(p.lines))}</td></tr>
            <tr><th className="border bg-muted p-1.5 text-right">سعر النقطة (شيكل)</th><td className="border p-1.5">{fmt(p.pricePerPoint)}</td></tr>
            <tr><th className="border bg-muted p-1.5 text-right">أجرة العمل (شيكل)</th><td className="border p-1.5">{fmt(laborTotal(p.lines, p.pricePerPoint))}</td></tr>
          </tbody>
        </table>
        <p className="mb-2 text-sm">المبلغ أجرة عمل فقط ولا يشمل أي مواد أو بضاعة.</p>
        <h2 className="mt-4 font-bold">البنود المتفق عليها:</h2>
        {terms.trim() ? (
          <ol className="list-decimal pr-6">{terms.split("\n").filter((t) => t.trim()).map((t, i) => <li key={i} className="py-0.5">{t}</li>)}</ol>
        ) : <p className="text-muted-foreground">(لم تُكتب بنود)</p>}
        <div className="mt-16 grid grid-cols-2 gap-8 text-center">
          <div><div className="border-t-2 border-foreground pt-1">توقيع صاحب العمل</div><div>{p.ownerName}</div></div>
          <div><div className="border-t-2 border-foreground pt-1">توقيع الكهربائي</div><div>{p.electricianName}</div></div>
        </div>
      </article>
    </div>
  );
}
