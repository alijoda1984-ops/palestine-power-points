import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ProjectList } from "@/components/ProjectList";
import { Shell } from "@/components/Shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "كيلة الأعمال الكهربائية" },
      { name: "description", content: "أداة الكهربائي لحساب النقاط وأجرة العمل، وحفظ المشاريع وطباعة الاتفاقيات." },
      { property: "og:title", content: "كيلة الأعمال الكهربائية" },
      { property: "og:description", content: "حساب نقاط الأعمال الكهربائية وأجرة العمل." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <Shell title="كيلة الأعمال الكهربائية" back={false}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">المشاريع المحفوظة</h2>
        <Button asChild className="btn btn-primary"><Link to="/projects/new">+ مشروع جديد</Link></Button>
      </div>
      <ProjectList />
      <nav className="mt-8 grid grid-cols-2 gap-3 border-t-2 pt-5" aria-label="إدارة التطبيق">
        <Button asChild variant="outline" className="btn btn-outline"><Link to="/data">كتالوج البنود</Link></Button>
        <Button asChild variant="outline" className="btn btn-outline"><Link to="/backup">النسخ الاحتياطي</Link></Button>
        <Button asChild variant="ghost" className="btn col-span-2"><Link to="/agreement">اتفاقية عمل</Link></Button>
      </nav>
      <p className="mt-4 text-sm text-muted-foreground">المشاريع محفوظة على هذا الجهاز فقط.</p>
    </Shell>
  );
}
