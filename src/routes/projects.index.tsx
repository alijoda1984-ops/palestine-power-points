import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { getProjects, useStore } from "@/lib/storage";
import { MODE_LABEL } from "@/lib/types";
import { fmt, laborTotal, totalPoints } from "@/lib/calc";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "المشاريع المحفوظة — كيلة الأعمال الكهربائية" },
      { name: "description", content: "قائمة المشاريع المحفوظة على الجهاز." },
      { property: "og:title", content: "المشاريع المحفوظة — كيلة الأعمال الكهربائية" },
      { property: "og:description", content: "قائمة المشاريع المحفوظة على الجهاز." },
    ],
  }),
  component: Projects,
});

function Projects() {
  const projects = useStore(getProjects);
  const [q, setQ] = useState("");
  const list = (projects ?? [])
    .filter((p) => !q.trim() || `${p.name} ${p.location} ${p.ownerName}`.includes(q.trim()))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return (
    <Shell title="المشاريع المحفوظة">
      <input className="field mb-4" placeholder="بحث بالاسم أو الموقع أو صاحب العمل" value={q} onChange={(e) => setQ(e.target.value)} />
      {projects === undefined ? <p>جارِ التحميل…</p> : list.length === 0 ? (
        <div className="grid gap-3 text-center">
          <p className="font-bold">لا توجد مشاريع محفوظة.</p>
          <Link to="/projects/new" className="btn btn-primary">مشروع جديد</Link>
        </div>
      ) : (
        <ul className="grid gap-3">
          {list.map((p) => (
            <li key={p.id}>
              <Link to="/projects/$id" params={{ id: p.id }} className="block rounded-xl border-2 border-foreground p-4 active:bg-muted">
                <div className="text-lg font-bold">{p.name}</div>
                <div className="text-muted-foreground">{[p.location, p.ownerName, p.date].filter(Boolean).join(" · ")}</div>
                <div className="mt-1 text-sm">{MODE_LABEL[p.mode]} · {fmt(totalPoints(p.lines))} نقطة · {fmt(laborTotal(p.lines, p.pricePerPoint))} شيكل</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}
