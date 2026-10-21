import { useState } from "react";
import type { Project } from "@/lib/types";
import { MODE_DESC, MODE_LABEL } from "@/lib/types";
import { ErrorBox } from "./Shell";
import { Button } from "@/components/ui/button";

export type ProjectDetails = Omit<Project, "id" | "lines" | "createdAt" | "updatedAt" | "agreementTerms">;

export function emptyDetails(): ProjectDetails {
  return {
    name: "", location: "", ownerName: "", ownerPhone: "", electricianName: "", electricianPhone: "",
    date: new Date().toISOString().slice(0, 10), mode: "goods", pricePerPoint: 0, notes: "",
  };
}

export function ProjectForm({ initial, submitLabel, onSubmit }: {
  initial: ProjectDetails; lockMode?: boolean; submitLabel: string; onSubmit: (d: ProjectDetails) => void;
}) {
  const [d, setD] = useState(initial);
  const [price, setPrice] = useState(initial.pricePerPoint ? String(initial.pricePerPoint) : "");
  const [errors, setErrors] = useState<{ name?: string; date?: string; price?: string }>({});
  const set = <K extends keyof ProjectDetails>(k: K, v: ProjectDetails[K]) => setD((x) => ({ ...x, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: { name?: string; date?: string; price?: string } = {};
    if (!d.name.trim()) er.name = "اسم المشروع مطلوب";
    if (!d.date) er.date = "التاريخ مطلوب";
    const p = Number(price.replace(",", "."));
    if (price.trim() === "" || !isFinite(p) || p < 0) er.price = "أدخل سعر نقطة صحيح (رقم 0 أو أكثر)";
    setErrors(er);
    if (Object.keys(er).length) return;
    onSubmit({ ...d, pricePerPoint: p });
  };

  const F = ({ k, label, type = "text", err }: { k: keyof ProjectDetails; label: string; type?: string; err?: string | undefined }) => (
    <label className="block">
      <span className="mb-1 block font-bold">{label}</span>
      <input className="field" type={type} value={String(d[k] ?? "")} aria-invalid={!!err}
        onChange={(e) => set(k, e.target.value as never)} inputMode={type === "tel" ? "tel" : undefined} />
      {err && <span className="mt-1 block font-bold text-destructive">{err}</span>}
    </label>
  );

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      {Object.keys(errors).length > 0 && <ErrorBox>يرجى تصحيح الحقول المؤشّر عليها.</ErrorBox>}
      {F({ k: "name", label: "اسم المشروع / الزبون *", err: errors.name })}
      {F({ k: "location", label: "الموقع" })}
      {F({ k: "date", label: "التاريخ *", type: "date", err: errors.date })}
      {F({ k: "ownerName", label: "اسم صاحب العمل" })}
      <div className="border-r-4 border-primary bg-muted p-3">
        <div className="font-bold">نوع الاتفاق: {MODE_LABEL[d.mode]}</div>
        <p className="text-sm">{MODE_DESC[d.mode]}</p>
      </div>
      <details>
        <summary className="min-h-12 cursor-pointer py-3 font-bold">بيانات التواصل والكهربائي</summary>
        <div className="grid gap-3 py-2">
          {F({ k: "ownerPhone", label: "هاتف صاحب العمل", type: "tel" })}
          {F({ k: "electricianName", label: "اسم الكهربائي" })}
          {F({ k: "electricianPhone", label: "هاتف الكهربائي", type: "tel" })}
        </div>
      </details>
      <label className="block">
        <span className="mb-1 block font-bold">سعر النقطة (شيكل) *</span>
        <input className="field" inputMode="decimal" value={price} aria-invalid={!!errors.price} onChange={(e) => setPrice(e.target.value)} placeholder="مثال: 25" />
        {errors.price && <span className="mt-1 block font-bold text-destructive">{errors.price}</span>}
      </label>
      <label className="block">
        <span className="mb-1 block font-bold">ملاحظات</span>
        <textarea className="field min-h-24" value={d.notes} onChange={(e) => set("notes", e.target.value)} />
      </label>
      <Button type="submit" className="btn btn-primary text-lg">{submitLabel}</Button>
    </form>
  );
}
