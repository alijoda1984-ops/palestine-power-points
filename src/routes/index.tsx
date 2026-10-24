import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { ArrowLeft, BookOpen, FileSignature, FolderOpen, HardDrive, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProjects, useStore } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "كيلة الأعمال الكهربائية" },
      { name: "description", content: "أداة الكهربائي لحساب النقاط وأجرة العمل، وحفظ المشاريع وطباعة الاتفاقيات." },
      { property: "og:title", content: "كيلة الأعمال الكهربائية" },
      { property: "og:description", content: "حساب نقاط الأعمال الكهربائية وأجرة العمل." },
    ],
  }),
  component: Index,
});

const actions = [
  { to: "/agreement", label: "اتفاقية عمل", icon: FileSignature },
  { to: "/backup", label: "النسخ الاحتياطي", icon: HardDrive },
] as const;

function Index() {
  const projects = useStore(getProjects);
  const latest = projects?.reduce<(typeof projects)[number] | undefined>((last, p) => !last || p.updatedAt > last.updatedAt ? p : last, undefined);
  return (
    <Shell title="كيلة الأعمال الكهربائية" back={false}>
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-bold">مشاريعك</h2>
        <span className="text-sm font-semibold text-primary">العمل مع بضاعة</span>
      </div>
      <Button asChild className="mb-3 h-20 w-full justify-between px-5 text-xl font-bold shadow-none [&_svg]:size-6">
        <Link to="/projects/new"><span className="flex items-center gap-3"><Plus />مشروع جديد</span><ArrowLeft /></Link>
      </Button>
      <Button asChild variant="outline" className="mb-6 h-20 w-full justify-between border-border bg-card px-5 text-lg font-bold shadow-none [&_svg]:size-6">
        <Link to="/projects"><span className="flex items-center gap-3"><FolderOpen className="text-primary" />المشاريع المحفوظة</span><span className="flex size-9 items-center justify-center rounded-md bg-secondary text-base text-secondary-foreground">{projects?.length ?? "…"}</span></Link>
      </Button>
      {latest && <div className="mb-6 border-b pb-5">
        <p className="mb-2 text-sm text-muted-foreground">آخر مشروع</p>
        <Button asChild variant="ghost" className="h-auto min-h-12 w-full justify-between whitespace-normal px-0 text-start text-base font-semibold"><Link to="/projects/$id" params={{ id: latest.id }}><span className="min-w-0 break-words">{latest.name}</span><ArrowLeft className="shrink-0" /></Link></Button>
      </div>}
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <Button key={a.to} asChild variant="outline" className="h-28 flex-col gap-3 whitespace-normal border-border bg-card px-2 text-base font-bold shadow-none [&_svg]:size-7"><Link to={a.to}><a.icon className="text-primary" /><span>{a.label}</span></Link></Button>
        ))}
      </div>
      <Button asChild variant="ghost" className="mt-3 h-16 w-full justify-between px-2 text-base [&_svg]:size-5"><Link to="/data"><span className="flex items-center gap-3"><BookOpen className="text-primary" />إدارة بيانات الكتب</span><ArrowLeft className="text-muted-foreground" /></Link></Button>
      <p className="mt-5 flex items-center justify-center gap-2 border-t pt-5 text-sm text-muted-foreground"><ShieldCheck className="size-4 shrink-0" />بياناتك محفوظة على هذا الجهاز فقط</p>
    </Shell>
  );
}
