import { Link } from "@tanstack/react-router";
import type { Project } from "@/lib/types";

export function PrintBar({ p }: { p: Project }) {
  return (
    <div className="no-print sticky top-0 z-10 flex gap-2 border-b-2 bg-background p-3">
      <Link to="/projects/$id" params={{ id: p.id }} className="btn btn-outline">‹ رجوع</Link>
      <button className="btn btn-primary flex-1" onClick={() => window.print()}>طباعة / حفظ PDF</button>
    </div>
  );
}

export function Parties({ p }: { p: Project }) {
  const row = (k: string, v: string) => (
    <tr><th className="w-36 border p-1.5 text-right bg-muted">{k}</th><td className="border p-1.5">{v || "—"}</td></tr>
  );
  return (
    <table className="mb-4 w-full border-collapse text-right">
      <tbody>
        {row("المشروع", p.name)}
        {row("الموقع", p.location)}
        {row("التاريخ", p.date)}
        {row("صاحب العمل", [p.ownerName, p.ownerPhone].filter(Boolean).join(" — "))}
        {row("الكهربائي", [p.electricianName, p.electricianPhone].filter(Boolean).join(" — "))}
      </tbody>
    </table>
  );
}
