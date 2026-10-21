import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { ProjectList } from "@/components/ProjectList";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "المشاريع المحفوظة — كيلة الأعمال الكهربائية" },
      { name: "description", content: "قائمة المشاريع المحفوظة على الجهاز." },
      { property: "og:title", content: "المشاريع المحفوظة" },
      { property: "og:description", content: "قائمة المشاريع المحفوظة على الجهاز." },
    ],
  }),
  component: Projects,
});

function Projects() {
  return (
    <Shell title="المشاريع المحفوظة">
      <Button asChild className="btn btn-primary mb-4 w-full"><Link to="/projects/new">+ مشروع جديد</Link></Button>
      <ProjectList />
    </Shell>
  );
}
