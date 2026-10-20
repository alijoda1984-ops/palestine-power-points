import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ErrorBox, Shell } from "@/components/Shell";
import { applyBackup, buildBackup, getProjects, parseBackup, useStore, type Backup } from "@/lib/storage";

export const Route = createFileRoute("/backup")({
  head: () => ({
    meta: [
      { title: "النسخ الاحتياطي — كيلة الأعمال الكهربائية" },
      { name: "description", content: "تصدير واستيراد نسخة احتياطية من المشاريع." },
      { property: "og:title", content: "النسخ الاحتياطي" },
      { property: "og:description", content: "تصدير واستيراد نسخة احتياطية من المشاريع." },
    ],
  }),
  component: BackupPage,
});

function BackupPage() {
  const projects = useStore(getProjects);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<Backup | null>(null);

  const exportFile = async () => {
    setError("");
    const b = buildBackup(); // always read fresh from device storage
    if (b.projects.length === 0) {
      setError("لا توجد مشاريع محفوظة في هذا التطبيق على هذا الجهاز. ملاحظة: التطبيق المضاف للشاشة الرئيسية وSafari لهما تخزين منفصل، وكذلك رابط المعاينة والرابط المنشور. افتح التطبيق من نفس المكان الذي أنشأت فيه المشاريع.");
      return;
    }
    const name = `kayla-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const text = JSON.stringify(b, null, 2);
    const file = new File([text], name, { type: "application/json" });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: name });
        toast.success(`تم تجهيز ${b.projects.length} مشروع للمشاركة/الحفظ`);
        return;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast.success(`تم تصدير ${b.projects.length} مشروع`);
  };

  const onFile = async (f: File | undefined) => {
    setError(""); setPending(null);
    if (!f) return;
    if (f.size > 10_000_000) return setError("الملف كبير جداً.");
    const r = parseBackup(await f.text());
    if (!r.ok) return setError(r.error);
    setPending(r.data);
  };

  const doImport = (mode: "merge" | "replace") => {
    if (!pending) return;
    if (mode === "replace" && !confirm("سيتم حذف كل المشاريع الحالية واستبدالها. متابعة؟")) return;
    try { const n = applyBackup(pending, mode); toast.success(`تم الاستيراد. عدد المشاريع الآن: ${n}`); setPending(null); setError(""); }
    catch (e) { setError((e as Error).message); }
  };

  return (
    <Shell title="النسخ الاحتياطي">
      <section className="mb-6 grid gap-2 rounded-xl border-2 p-4">
        <h2 className="text-lg font-bold">تصدير</h2>
        <p>عدد المشاريع على الجهاز: <b>{projects?.length ?? "…"}</b>. الملف يشمل المشاريع وبيانات الكتب المستوردة.</p>
        {projects && projects.length === 0 && <p className="rounded-lg border-2 border-dashed p-2 font-bold">لا توجد مشاريع محفوظة بعد. أنشئ مشروعاً أولاً أو استورد نسخة.</p>}
        <button className="btn btn-primary" onClick={exportFile} disabled={!projects || projects.length === 0}>حفظ ملف النسخة (JSON)</button>
        <p className="text-sm text-muted-foreground">على الآيفون: احفظ الملف في «الملفات» أو أرسله لنفسك. البيانات تُحذف إذا مُسحت بيانات Safari.</p>
      </section>
      <section className="grid gap-2 rounded-xl border-2 p-4">
        <h2 className="text-lg font-bold">استيراد</h2>
        <input type="file" key={pending ? "p" : "n"} accept="application/json,.json" className="field" aria-label="ملف النسخة الاحتياطية" onChange={(e) => onFile(e.target.files?.[0])} />
        {error && <ErrorBox>{error}</ErrorBox>}
        {pending && (
          <div className="grid gap-2 rounded-lg bg-muted p-3">
            {pending.projects.length === 0 && <ErrorBox>هذا الملف لا يحتوي على أي مشروع.</ErrorBox>}
            <p>ملف صالح: <b>{pending.projects.length}</b> مشروع، بتاريخ {pending.exportedAt.slice(0, 10)}.</p>
            <button className="btn btn-primary" onClick={() => doImport("merge")}>دمج مع الموجود</button>
            <button className="btn btn-danger" onClick={() => doImport("replace")}>استبدال الكل</button>
          </div>
        )}
      </section>
    </Shell>
  );
}
