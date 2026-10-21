import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { getProjects, useStore } from "@/lib/storage";
import { MODE_LABEL } from "@/lib/types";
import { fmt, laborTotal, totalPoints } from "@/lib/calc";

export function ProjectList() {
  const projects = useStore(getProjects);
  const [q, setQ] = useState("");
  const list = (projects ?? []).filter((p) => `${p.name} ${p.location} ${p.ownerName}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return (
    <>
      <input className="field mb-4" type="search" aria-label="بحث في المشاريع" placeholder="بحث بالاسم أو الموقع" value={q} onChange={(e) => setQ(e.target.value)} />
      {projects === undefined ? <p>جارِ التحميل…</p> : list.length === 0 ? (
        <p className="border-y py-8 text-center text-muted-foreground">{q ? "لا توجد نتائج مطابقة." : "لا توجد مشاريع محفوظة على هذا الجهاز."}</p>
      ) : (
        <ul className="grid gap-3">
          {list.map((p) => <li key={p.id}>
            <Link to="/projects/$id" params={{ id: p.id }} className="block rounded-lg border-2 p-4 active:bg-muted">
              <div className="break-words text-lg font-bold">{p.name}</div>
              <div className="text-sm text-muted-foreground">{[p.location, p.ownerName, p.date].filter(Boolean).join(" · ")}</div>
              <div className="mt-2 text-sm">{MODE_LABEL[p.mode]} · {fmt(totalPoints(p.lines))} نقطة</div>
              <div className="font-bold text-primary">أجرة العمل: {fmt(laborTotal(p.lines, p.pricePerPoint))} شيكل</div>
            </Link>
          </li>)}
        </ul>
      )}
    </>
  );
}