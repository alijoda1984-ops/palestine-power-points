import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";

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
  { to: "/agreement", label: "اتفاقية عمل", sub: "طباعة اتفاقية لمشروع" },
  { to: "/projects/new", label: "مشروع جديد", sub: "إنشاء كيلة جديدة" },
  { to: "/projects", label: "المشاريع المحفوظة", sub: "فتح وتعديل المشاريع" },
  { to: "/backup", label: "النسخ الاحتياطي", sub: "تصدير واستيراد ملف" },
] as const;

function Index() {
  return (
    <Shell title="كيلة الأعمال الكهربائية" back={false}>
      <div className="grid gap-3">
        {actions.map((a) => (
          <Link key={a.to} to={a.to} className="flex min-h-20 flex-col justify-center rounded-xl border-2 border-foreground bg-background px-5 py-3 active:bg-muted">
            <span className="text-xl font-bold">{a.label}</span>
            <span className="text-muted-foreground">{a.sub}</span>
          </Link>
        ))}
        <Link to="/data" className="flex min-h-16 flex-col justify-center rounded-xl border-2 border-dashed border-foreground px-5 py-3">
          <span className="text-lg font-bold">إدارة بيانات الكتب</span>
          <span className="text-muted-foreground">استيراد قيم النقاط الموثّقة</span>
        </Link>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        البيانات محفوظة على هذا الجهاز فقط. للتثبيت على الآيفون: افتح رابط التطبيق المنشور (https) في Safari ثم «مشاركة» ← «إضافة إلى الشاشة الرئيسية».
      </p>
    </Shell>
  );
}
