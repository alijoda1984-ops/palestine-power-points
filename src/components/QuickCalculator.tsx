import { useState } from "react";
import { Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmt, quickLabor } from "@/lib/calc";

export function QuickCalculator() {
  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState("");
  const [price, setPrice] = useState("");
  const amount = quickLabor(points, price);
  const invalid = points.trim() !== "" && price.trim() !== "" && amount === null;
  return <section className="mt-4 border-t py-4">
    <Button variant="ghost" className="min-h-12 w-full justify-between px-2 text-base" aria-expanded={open} aria-controls="quick-calculator" onClick={() => setOpen((v) => !v)}>
      <span className="flex items-center gap-3"><Calculator className="text-primary" />حاسبة ميدانية سريعة</span>{open ? <ChevronUp /> : <ChevronDown />}
    </Button>
    {open && <div id="quick-calculator" className="mt-3 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="min-w-0 space-y-2 text-sm font-semibold"><span>مجموع النقاط</span><input className="field w-full" inputMode="decimal" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="0" aria-invalid={invalid} /></label>
        <label className="min-w-0 space-y-2 text-sm font-semibold"><span>سعر النقطة (شيكل)</span><input className="field w-full" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" aria-invalid={invalid} /></label>
      </div>
      {invalid && <p role="alert" className="text-sm text-destructive">أدخل أرقاماً صالحة تساوي صفراً أو أكبر.</p>}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b py-3"><span className="text-sm">أجرة العمل التقديرية (شيكل)</span><output className="break-all text-2xl font-bold text-primary" aria-live="polite" aria-label="أجرة العمل التقديرية">{amount === null ? "—" : fmt(amount)}</output></div>
      <p className="text-xs text-muted-foreground">تقدير غير محفوظ · أجرة عمل فقط</p>
    </div>}
  </section>;
}