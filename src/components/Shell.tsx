import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function Shell({ title, back = true, children }: { title: string; back?: boolean; children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-3xl pb-28">
      <header className="no-print sticky top-0 z-10 flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
        {back && (
          <Link to="/" className="btn min-h-11 border-primary-foreground px-3 text-base" aria-label="الرئيسية">
            ‹ الرئيسية
          </Link>
        )}
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
