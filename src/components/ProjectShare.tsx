import { useState } from "react";
import { Copy, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { projectSummary } from "@/lib/calc";
import type { Project } from "@/lib/types";

export function ProjectShare({ project }: { project: Project }) {
  const [copyFallback, setCopyFallback] = useState(false);
  const text = projectSummary(project);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("تم نسخ ملخص المشروع");
      setCopyFallback(false);
    } catch {
      setCopyFallback(true);
      toast.error("تعذّر النسخ التلقائي؛ حدّد النص وانسخه");
    }
  };
  return <Dialog>
    <DialogTrigger asChild><Button variant="outline" className="no-print min-h-12 whitespace-normal"><Share2 />مشاركة عبر واتساب</Button></DialogTrigger>
    <DialogContent dir="rtl" className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg p-5">
      <DialogTitle className="pe-7 text-start tracking-normal">ملخص المشروع</DialogTitle>
      <DialogDescription className="text-start">{project.name}</DialogDescription>
      <textarea aria-label="ملخص المشروع" readOnly value={text} onFocus={(e) => { if (copyFallback) e.target.select(); }} className="field min-h-64 w-full resize-none text-sm leading-7" />
      <div className="flex flex-wrap gap-2">
        <Button asChild className="min-h-12 flex-1"><a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer"><MessageCircle />فتح واتساب</a></Button>
        <Button variant="outline" className="min-h-12 flex-1" onClick={copy}><Copy />نسخ الملخص</Button>
      </div>
    </DialogContent>
  </Dialog>;
}