import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { getProjects, useStore } from "@/lib/storage";

export const Route = createFileRoute("/agreement")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "اختيار مشروع للاتفاقية — كيلة الأعمال الكهربائية" },
      { name: "description", content: "اختر مشروعاً لإعداد وطباعة اتفاقية العمل." },
      { property: "og:title", content: "اختيار مشروع للاتفاقية — كيلة الأعمال الكهربائية" },
      { property: "og:description", content: "اختر مشروعاً لإعداد وطباعة اتفاقية العمل." },
    ],
  }),
  component: AgreementPick,
});

function AgreementPick() {
  const ps = useStore(getProjects);
  return (
    <Shell title="اتفاقية عمل">
      <p className="mb-3">الاتفاقية مرتبطة بمشروع. اختر مشروعاً أو أنشئ واحداً جديداً.</p>
      <Link to="/projects/new" className="btn btn-primary mb-4 w-full">مشروع جديد</Link>
      <ul className="grid gap-2">
        {(ps ?? []).map((p) => (
          <li key={p.id}><Link to="/projects/$id/agreement" params={{ id: p.id }} className="btn btn-outline w-full justify-start">{p.name}</Link></li>
        ))}
      </ul>
      {ps && ps.length === 0 && <p className="text-muted-foreground">لا توجد مشاريع بعد.</p>}
    </Shell>
  );
}
