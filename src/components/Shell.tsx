import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Shell({ title, back = true, children }: { title: string; back?: boolean; children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-3xl pb-28">
      <header className="no-print sticky top-0 z-10 flex min-h-20 items-center gap-3 border-b bg-background px-4 py-3 text-foreground" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
        {back && (
          <Button asChild variant="outline" className="size-12 shrink-0" title="الرئيسية"><Link to="/" aria-label="الرئيسية"><ArrowRight /></Link></Button>
        )}
        {!back && <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Zap className="size-6" aria-hidden="true" /></span>}
        <h1 className="text-lg font-bold leading-tight">{title}</h1>
      </header>
      <main className="px-4 py-5">{children}</main>
    </div>
  );
}

export function TestBadge({ children = "بيانات تجريبية — ليست رسمية" }: { children?: ReactNode }) {
  return (
    <span className="inline-block rounded-md border-2 border-warning-foreground bg-warning px-2 py-0.5 text-sm font-bold text-warning-foreground">
      {children}
    </span>
  );
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-lg border-2 border-destructive bg-background p-3 font-bold text-destructive">
      {children}
    </div>
  );
}
