import fs from 'node:fs';
import path from 'node:path';
import { pageMetaSchema, styleMetaSchema, type PageMeta, type StyleMeta } from './schema';
import { SEED_CATEGORIES, SEED_DESCRIPTIONS } from './seed-data';

/** 仓库根目录（web 以 dev/start 方式运行时 cwd = web） */
export const ROOT = process.env.PLATFORM_ROOT ?? path.resolve(process.cwd(), '..');
export const PAGES_DIR = path.join(ROOT, 'generated', 'pages');
export const STYLES_DIR = path.join(ROOT, 'generated', 'styles');
export const SEED_DIR = path.join(ROOT, 'awesome-design-md', 'design-md');

export interface GalleryPage {
  dir: string;
  meta: PageMeta | null;
  metaError?: string;
  hasScreenshot: boolean;
  hasNotes: boolean;
}

export interface SeedStyle {
  name: string;
  category: string;
  description: string;
  hasPreview: boolean;
  hasDark: boolean;
}

export interface DerivedStyle {
  dir: string;
  meta: StyleMeta | null;
  metaError?: string;
  childCountActual: number;
}

function readDirs(dir: string): string[] {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return [];
  }
}

export function listPages(): GalleryPage[] {
  return readDirs(PAGES_DIR).map((dir) => {
    const pageDir = path.join(PAGES_DIR, dir);
    const metaFile = path.join(pageDir, 'meta.json');
    let meta: PageMeta | null = null;
    let metaError: string | undefined;
    try {
      const raw = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
      const parsed = pageMetaSchema.safeParse(raw);
      if (parsed.success) meta = parsed.data;
      else metaError = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    } catch (e) {
      metaError = e instanceof Error ? e.message : String(e);
    }
    return {
      dir,
      meta,
      metaError,
      hasScreenshot: fs.existsSync(path.join(pageDir, 'screenshot.png')),
      hasNotes: fs.existsSync(path.join(pageDir, 'notes.md')),
    };
  });
}

export function getPage(id: string): { dir: string; meta: PageMeta | null; metaError?: string; notes: string | null } | null {
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  const pageDir = path.join(PAGES_DIR, id);
  if (!fs.existsSync(pageDir)) return null;
  const entry = listPages().find((p) => p.dir === id);
  if (!entry) return null;
  let notes: string | null = null;
  try {
    notes = fs.readFileSync(path.join(pageDir, 'notes.md'), 'utf8');
  } catch {
    notes = null;
  }
  return { dir: entry.dir, meta: entry.meta, metaError: entry.metaError, notes };
}

/** 人工策展写回：读旧 meta → 合并 patch → 全量校验 → 原子写回（写入目标收敛在 generated/pages 内） */
export function updatePage(id: string, patch: Record<string, unknown>): { ok: true; meta: PageMeta } | { ok: false; status: number; error: string } {
  if (!/^[a-z0-9-]+$/.test(id)) return { ok: false, status: 400, error: '非法页面 id' };
  const pagesRoot = path.resolve(PAGES_DIR);
  const pageDir = path.resolve(pagesRoot, id);
  if (!pageDir.startsWith(pagesRoot + path.sep)) return { ok: false, status: 400, error: '非法页面 id' };
  const metaFile = path.join(pageDir, 'meta.json');
  if (!fs.existsSync(metaFile)) return { ok: false, status: 404, error: '页面不存在' };
  let current: unknown;
  try {
    current = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
  } catch (e) {
    return { ok: false, status: 500, error: `meta.json 解析失败：${e instanceof Error ? e.message : e}` };
  }
  const merged = { ...(current as Record<string, unknown>), ...patch };
  const parsed = pageMetaSchema.safeParse(merged);
  if (!parsed.success) {
    return { ok: false, status: 400, error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') };
  }
  // 原子写回：先写 .tmp 再 rename；Windows 上目标被占用时降级为覆盖写
  const tmp = metaFile + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(parsed.data, null, 2) + '\n', 'utf8');
  try {
    fs.renameSync(tmp, metaFile);
  } catch {
    fs.copyFileSync(tmp, metaFile);
    fs.rmSync(tmp);
  }
  return { ok: true, meta: parsed.data };
}

export function listSeedStyles(): SeedStyle[] {
  return readDirs(SEED_DIR)
    .map((name) => ({
      name,
      category: SEED_CATEGORIES[name] ?? '未分类',
      description: SEED_DESCRIPTIONS[name] ?? '',
      hasPreview: fs.existsSync(path.join(SEED_DIR, name, 'preview.html')),
      hasDark: fs.existsSync(path.join(SEED_DIR, name, 'preview-dark.html')),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function listDerivedStyles(): DerivedStyle[] {
  const pages = listPages();
  return readDirs(STYLES_DIR).map((dir) => {
    const styleDir = path.join(STYLES_DIR, dir);
    let meta: StyleMeta | null = null;
    let metaError: string | undefined;
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(styleDir, 'meta.json'), 'utf8'));
      const parsed = styleMetaSchema.safeParse(raw);
      if (parsed.success) meta = parsed.data;
      else metaError = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    } catch (e) {
      metaError = e instanceof Error ? e.message : String(e);
    }
    const childCountActual = pages.filter((p) => p.meta?.lineage.includes(dir)).length;
    return { dir, meta, metaError, childCountActual };
  });
}
