import { useState } from "react";
import type { Project } from "@/lib/types";
import { projectModeOptions } from "@/lib/agreement-phase";
import { MODE_DESC, MODE_LABEL } from "@/lib/types";
import { ErrorBox } from "./Shell";

export type ProjectDetails = Omit<Project, "id" | "lines" | "createdAt" | "updatedAt" | "agreementTerms">;

export function emptyDetails(): ProjectDetails {
  return {
    name: "", location: "", ownerName: "", ownerPhone: "", electricianName: "", electricianPhone: "",
    date: new Date().toISOString().slice(0, 10), mode: "goods", pricePerPoint: 0, notes: "",
  };
}

export function ProjectForm({ initial, lockMode, submitLabel, onSubmit }: {
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
      <fieldset className="grid gap-3 rounded-xl border-2 p-3">
        <legend className="px-1 font-bold">صاحب العمل</legend>
        {F({ k: "ownerName", label: "الاسم" })}
        {F({ k: "ownerPhone", label: "الهاتف", type: "tel" })}
      </fieldset>
      <fieldset className="grid gap-3 rounded-xl border-2 p-3">
        <legend className="px-1 font-bold">الكهربائي</legend>
        {F({ k: "electricianName", label: "الاسم" })}
        {F({ k: "electricianPhone", label: "الهاتف", type: "tel" })}
      </fieldset>
      <fieldset className="grid gap-2 rounded-xl border-2 p-3" disabled={lockMode}>
        <legend className="px-1 font-bold">نوع الاتفاق</legend>
        {projectModeOptions(initial.mode).map((m) => (
          <label key={m} className="flex min-h-12 items-center py-2 gap-3 rounded-lg border-2 px-3 has-[:checked]:border-primary has-[:checked]:bg-muted">
            <input type="radio" name="mode" className="size-5" checked={d.mode === m} onChange={() => set("mode", m)} />
            <span><span className="block font-bold">{MODE_LABEL[m]}</span><span className="block text-sm text-muted-foreground">{MODE_DESC[m]}</span></span>
          </label>
        ))}
        {lockMode && <span className="text-sm text-muted-foreground">لا يمكن تغيير النوع بعد إضافة بنود، لأن لكل نوع قيم نقاط مختلفة.</span>}
      </fieldset>
      <label className="block">
        <span className="mb-1 block font-bold">سعر النقطة (شيكل) *</span>
        <input className="field" inputMode="decimal" value={price} aria-invalid={!!errors.price} onChange={(e) => setPrice(e.target.value)} placeholder="مثال: 25" />
        {errors.price && <span className="mt-1 block font-bold text-destructive">{errors.price}</span>}
      </label>
      <label className="block">
        <span className="mb-1 block font-bold">ملاحظات</span>
        <textarea className="field min-h-24" value={d.notes} onChange={(e) => set("notes", e.target.value)} />
      </label>
      <button type="submit" className="btn btn-primary text-lg">{submitLabel}</button>
    </form>
  );
}
