import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Shell } from "@/components/Shell";
import { ProjectForm, emptyDetails } from "@/components/ProjectForm";
import { saveProject, uid } from "@/lib/storage";

export const Route = createFileRoute("/projects/new")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "مشروع جديد — كيلة الأعمال الكهربائية" },
      { name: "description", content: "إنشاء مشروع كيلة كهربائية جديد." },
      { property: "og:title", content: "مشروع جديد — كيلة الأعمال الكهربائية" },
      { property: "og:description", content: "إنشاء مشروع كيلة كهربائية جديد." },
    ],
  }),
  component: NewProject,
});

function NewProject() {
  const nav = useNavigate();
  return (
    <Shell title="مشروع جديد">
      <ProjectForm initial={emptyDetails()} submitLabel="إنشاء المشروع" onSubmit={(d) => {
        const now = new Date().toISOString();
        try {
          const p = saveProject({ ...d, id: uid(), lines: [], agreementTerms: "", createdAt: now, updatedAt: now });
          toast.success("تم إنشاء المشروع");
          nav({ to: "/projects/$id", params: { id: p.id } });
        } catch (e) { toast.error((e as Error).message); }
      }} />
    </Shell>
  );
}
