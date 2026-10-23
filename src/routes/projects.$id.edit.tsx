import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Shell } from "@/components/Shell";
import { ProjectForm } from "@/components/ProjectForm";
import { getProject, saveProject, useStore } from "@/lib/storage";

export const Route = createFileRoute("/projects/$id/edit")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "تعديل بيانات المشروع — كيلة الأعمال الكهربائية" },
      { name: "description", content: "تعديل بيانات المشروع." },
      { property: "og:title", content: "تعديل المشروع — كيلة الأعمال الكهربائية" },
      { property: "og:description", content: "تعديل بيانات المشروع." },
    ],
  }),
  component: EditProject,
});

function EditProject() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const p = useStore(() => getProject(id));
  if (p === undefined) return <Shell title="تعديل المشروع"><p>جارِ التحميل…</p></Shell>;
  if (!p) return <Shell title="تعديل المشروع"><p className="font-bold">المشروع غير موجود.</p></Shell>;
  return (
    <Shell title="تعديل بيانات المشروع">
      <ProjectForm initial={p} lockMode={p.lines.length > 0} submitLabel="حفظ" onSubmit={(d) => {
        try {
          saveProject({ ...p, ...d, mode: p.lines.length ? p.mode : d.mode });
          toast.success("تم الحفظ");
          nav({ to: "/projects/$id", params: { id } });
        } catch (e) { toast.error((e as Error).message); }
      }} />
    </Shell>
  );
}
