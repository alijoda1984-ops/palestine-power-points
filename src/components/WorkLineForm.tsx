import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorBox } from "@/components/Shell";
import { fmt, lineTotal } from "@/lib/calc";
import { uid } from "@/lib/storage";
import type { ProjectLine } from "@/lib/types";

export function WorkLineForm({ onAdd, initial, submitLabel = "إضافة البند", onCancel }: {
  onAdd: (line: ProjectLine) => void; initial?: ProjectLine | undefined; submitLabel?: string; onCancel?: () => void;
}) {
  const [f, setF] = useState(initial ? { section: initial.section, code: initial.code, name: initial.name, points: String(initial.pointsPerItem), qty: String(initial.quantity) }
    : { section: "", code: "", name: "", points: "", qty: "1" });
  const [error, setError] = useState("");
  const points = Number(f.points.replace(",", ".")), quantity = Number(f.qty.replace(",", "."));
  const total = f.points.trim() && Number.isFinite(points) && points >= 0 && Number.isFinite(quantity) && quantity > 0
    ? fmt(lineTotal({ pointsPerItem: points, quantity })) : "—";
  return <form className="grid gap-3 border-y-2 py-4" noValidate onSubmit={(e) => {
    e.preventDefault();
    if (!f.name.trim()) return setError("اسم البند مطلوب");
    if (!f.points.trim() || !Number.isFinite(points) || points < 0) return setError("أدخل نقاطاً صحيحة (صفر أو أكثر)");
    if (!Number.isFinite(quantity) || quantity <= 0) return setError("الكمية يجب أن تكون أكبر من صفر");
    onAdd({ id: initial?.id ?? uid(), catalogItemId: initial?.catalogItemId ?? null, section: f.section.trim() || "بنود يدوية", code: f.code.trim(), name: f.name.trim(), pointsPerItem: points, quantity, isTest: initial?.isTest ?? false });
  }}>
    {error && <ErrorBox>{error}</ErrorBox>}
    <label className="font-bold">اسم البند *<input className="field mt-1 font-normal" aria-label="اسم البند" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
    <div className="grid grid-cols-2 gap-3">
      <label className="font-bold">الكود<input className="field mt-1 font-normal" aria-label="الرمز" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} /></label>
      <label className="font-bold">القسم<input className="field mt-1 font-normal" aria-label="قسم البند" value={f.section} onChange={(e) => setF({ ...f, section: e.target.value })} /></label>
      <label className="font-bold">نقاط لكل وحدة *<input className="field mt-1 font-normal" inputMode="decimal" aria-label="نقاط للوحدة" value={f.points} onChange={(e) => setF({ ...f, points: e.target.value })} /></label>
      <label className="font-bold">الكمية *<input className="field mt-1 font-normal" inputMode="decimal" aria-label="كمية البند" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} /></label>
    </div>
    <output className="flex justify-between bg-muted p-3 font-bold" aria-live="polite">مجموع نقاط البند <span>{total}</span></output>
    <Button className="btn btn-primary" type="submit">{submitLabel}</Button>
    {onCancel && <Button className="btn btn-outline" variant="outline" type="button" onClick={onCancel}>إلغاء</Button>}
  </form>;
}