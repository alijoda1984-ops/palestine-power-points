import { useEffect, useState } from "react";
import { z } from "zod";
import type { AgreementMode, Catalog, Project } from "./types";
import { defaultCatalog } from "./catalog";

const PROJECTS_KEY = "kayla.projects.v1";
const catalogKey = (m: AgreementMode) => `kayla.catalog.${m}.v1`;
const EVT = "kayla-store-change";

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error("تعذّر الحفظ على الجهاز (قد تكون مساحة التخزين ممتلئة أو التصفح الخاص مفعّل).");
  }
  window.dispatchEvent(new Event(EVT));
}

export const getProjects = (): Project[] => {
  const v = read<unknown>(PROJECTS_KEY, []);
  if (!Array.isArray(v)) return [];
  return v.filter((p): p is Project => !!p && typeof p === "object" && typeof (p as Project).id === "string");
};
export const getProject = (id: string) => getProjects().find((p) => p.id === id) ?? null;

export function saveProject(p: Project) {
  const all = getProjects();
  const next = { ...p, updatedAt: new Date().toISOString() };
  const i = all.findIndex((x) => x.id === p.id);
  if (i >= 0) all[i] = next;
  else all.push(next);
  write(PROJECTS_KEY, all);
  return next;
}
export function deleteProject(id: string) {
  write(PROJECTS_KEY, getProjects().filter((p) => p.id !== id));
}
export const setProjects = (ps: Project[]) => write(PROJECTS_KEY, ps);

export const getCatalog = (m: AgreementMode): Catalog => {
  const c = read<Catalog | null>(catalogKey(m), null);
  // Old versions shipped sample rows flagged isTest; never show them.
  return c && !c.isTest ? c : defaultCatalog(m);
};
export const saveCatalog = (c: Catalog) => write(catalogKey(c.mode), c);
export function resetCatalog(m: AgreementMode) {
  localStorage.removeItem(catalogKey(m));
  window.dispatchEvent(new Event(EVT));
}

/** Read store after hydration; re-reads on any store change. */
export function useStore<T>(reader: () => T): T | undefined {
  const [v, setV] = useState<T | undefined>(undefined);
  useEffect(() => {
    const load = () => setV(reader());
    load();
    window.addEventListener(EVT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(EVT, load);
      window.removeEventListener("storage", load);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}

/* ---------- Backup ---------- */
const modeZ = z.enum(["goods", "manufacturing"]);
const lineZ = z.object({
  id: z.string(),
  catalogItemId: z.string().nullable().default(null),
  section: z.string().default(""),
  code: z.string().default(""),
  name: z.string(),
  pointsPerItem: z.number().finite().min(0),
  quantity: z.number().finite().min(0),
  isTest: z.boolean().default(false),
});
export const projectZ = z.object({
  id: z.string().min(1),
  name: z.string(),
  location: z.string().default(""),
  ownerName: z.string().default(""),
  ownerPhone: z.string().default(""),
  electricianName: z.string().default(""),
  electricianPhone: z.string().default(""),
  date: z.string().default(""),
  mode: modeZ,
  pricePerPoint: z.number().finite().min(0),
  agreementTerms: z.string().default(""),
  notes: z.string().default(""),
  lines: z.array(lineZ),
  createdAt: z.string().default(""),
  updatedAt: z.string(),
});
const catalogZ = z.object({
  mode: modeZ,
  isTest: z.boolean(),
  sourceLabel: z.string(),
  importedAt: z.string().nullable(),
  items: z.array(
    z.object({
      id: z.string(),
      section: z.string(),
      code: z.string(),
      name: z.string(),
      points: z.number().finite().min(0),
    }),
  ),
});
export const backupZ = z.object({
  app: z.literal("kayla-electric"),
  version: z.literal(1),
  exportedAt: z.string(),
  projects: z.array(projectZ),
  catalogs: z
    .object({ goods: catalogZ.nullable().default(null), manufacturing: catalogZ.nullable().default(null) })
    .default({ goods: null, manufacturing: null }),
});
export type Backup = z.infer<typeof backupZ>;

export function buildBackup(): Backup {
  const stored = (m: AgreementMode) => read<Catalog | null>(catalogKey(m), null);
  return {
    app: "kayla-electric",
    version: 1,
    exportedAt: new Date().toISOString(),
    projects: getProjects(),
    catalogs: { goods: stored("goods"), manufacturing: stored("manufacturing") },
  };
}

export function parseBackup(text: string): { ok: true; data: Backup } | { ok: false; error: string } {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: "الملف ليس بصيغة JSON صحيحة." };
  }
  const r = backupZ.safeParse(json);
  if (!r.success) {
    const first = r.error.issues[0];
    return {
      ok: false,
      error: `الملف ليس نسخة احتياطية صالحة لهذا التطبيق (${first?.path.join(".") || "الجذر"}: ${first?.message}).`,
    };
  }
  return { ok: true, data: r.data as Backup };
}

/** Merge: projects with same id are replaced by the backup version. */
export function applyBackup(b: Backup, mode: "merge" | "replace") {
  const base = mode === "replace" ? [] : getProjects();
  const map = new Map(base.map((p) => [p.id, p]));
  for (const p of b.projects) map.set(p.id, p as Project);
  const merged = [...map.values()];
  setProjects(merged);
  // Verify the write really landed before reporting success.
  if (getProjects().length !== merged.length) throw new Error("لم يتم حفظ المشاريع المستوردة على الجهاز.");
  if (b.catalogs.goods) saveCatalog(b.catalogs.goods as Catalog);
  if (b.catalogs.manufacturing) saveCatalog(b.catalogs.manufacturing as Catalog);
  return map.size;
}
