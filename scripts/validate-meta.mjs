#!/usr/bin/env node
/**
 * validate-meta.mjs — 校验 generated/ 下所有 meta.json 是否符合 schema/meta.schema.json。
 * 本脚本零依赖，手工实现 schema 的关键约束；修改 schema 时需同步本脚本。
 * 退出码：0 = 全部合法；1 = 存在违规（红线 R4）。
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const errors = [];

const PAGE_ID_RE = /^[0-9]{8}-[a-z0-9]+(-[a-z0-9]+)*$/;
const STYLE_ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*-v[0-9]+$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)$/;
const PAGE_TYPES = ['landing', 'dashboard', 'pricing', 'portfolio', 'blog', 'docs', 'login', 'e-commerce', 'settings', 'marketing'];
const INDUSTRIES = ['fintech', 'dev-tool', 'ai', 'travel', 'health', 'education', 'social', 'media', 'enterprise', 'consumer', 'music', 'gaming', 'sports', 'food', 'fashion', 'real-estate', 'entertainment', 'science'];
const MOODS = ['minimal', 'dense', 'playful', 'premium', 'brutalist', 'soft', 'dark-first', 'editorial', 'retro', 'futuristic'];
const ORIGINS = ['study', 'remix', 'original'];
const STATUSES = ['draft', 'published', 'promoted', 'archived'];

function err(file, msg) {
  errors.push(`${file}: ${msg}`);
}

function validatePageMeta(file, m, dirName) {
  if (!PAGE_ID_RE.test(m.id ?? '')) err(file, `id "${m.id}" 不符合页面命名规范 YYYYMMDD-主题-类型[-序号]`);
  if (m.id !== dirName) err(file, `id "${m.id}" 与目录名 "${dirName}" 不一致`);
  if (typeof m.title !== 'string' || !m.title) err(file, 'title 缺失或为空');
  if (!ISO_RE.test(m.created_at ?? '')) err(file, `created_at "${m.created_at}" 不是合法 ISO 8601`);
  if (typeof m.generator?.agent !== 'string' || !m.generator.agent) err(file, 'generator.agent 缺失');
  if (typeof m.generator?.invoked_by !== 'string' || !m.generator.invoked_by) err(file, 'generator.invoked_by 缺失');
  if (!ORIGINS.includes(m.origin)) err(file, `origin "${m.origin}" 非法`);
  if (!Array.isArray(m.lineage)) err(file, 'lineage 必须是数组');
  else {
    if (m.origin === 'study' && m.lineage.length !== 1) err(file, 'study 模式 lineage 必须恰好 1 项');
    if (m.origin === 'remix' && m.lineage.length < 2) err(file, 'remix 模式 lineage 必须 ≥ 2 项');
    if (m.origin === 'original' && m.lineage.length !== 0) err(file, 'original 模式 lineage 必须为空数组');
    if (m.lineage.some((x) => typeof x !== 'string' || !x)) err(file, 'lineage 含非法项');
  }
  if (!PAGE_TYPES.includes(m.page_type)) err(file, `page_type "${m.page_type}" 不在词表内`);
  if (!Array.isArray(m.industry) || !m.industry.length || !m.industry.every((x) => INDUSTRIES.includes(x))) err(file, 'industry 必须是非空数组且全部在词表内');
  if (!Array.isArray(m.mood) || !m.mood.length || !m.mood.every((x) => MOODS.includes(x))) err(file, 'mood 必须是非空数组且全部在词表内');
  if (![0, 1, 2, 3].includes(m.innovation)) err(file, `innovation "${m.innovation}" 必须是 0-3 整数`);
  if (!Array.isArray(m.tags_ai) || m.tags_ai.length < 3) err(file, 'tags_ai 至少 3 个（AI 预打标签规则）');
  if (!Array.isArray(m.tags_user)) err(file, 'tags_user 必须是数组（可为空）');
  if (m.rating !== null) {
    if (typeof m.rating !== 'number' || m.rating < 1 || m.rating > 5 || (m.rating * 2) % 1 !== 0) err(file, `rating "${m.rating}" 必须是 null 或 1-5 的 0.5 步进数值`);
  }
  if (!STATUSES.includes(m.status)) err(file, `status "${m.status}" 非法`);
  if (m.files?.html !== 'index.html' || m.files?.notes !== 'notes.md') err(file, 'files 必须是 { html: index.html, notes: notes.md }');
  // 四件套（R4）：screenshot 允许缺失（由脚本生成）
  if (!existsSync(path.join(path.dirname(file), 'index.html'))) err(file, '缺少 index.html（红线 R4 四件套）');
  if (!existsSync(path.join(path.dirname(file), 'notes.md'))) err(file, '缺少 notes.md（红线 R4 四件套）');
}

function validateStyleMeta(file, m, dirName) {
  if (!STYLE_ID_RE.test(m.id ?? '')) err(file, `id "${m.id}" 不符合风格命名规范 <英文名>-v<版本>`);
  if (m.id !== dirName) err(file, `id "${m.id}" 与目录名 "${dirName}" 不一致`);
  if (typeof m.name !== 'string' || !m.name) err(file, 'name 缺失');
  if (!ISO_RE.test(m.created_at ?? '')) err(file, `created_at "${m.created_at}" 不是合法 ISO 8601`);
  if (!PAGE_ID_RE.test(m.source_page ?? '')) err(file, `source_page "${m.source_page}" 必须指向一个页面 id`);
  if (!Array.isArray(m.lineage) || !m.lineage.length) err(file, 'lineage 必须是非空数组');
  for (const k of ['inherited_rating', 'rating']) {
    if (typeof m[k] !== 'number' || m[k] < 1 || m[k] > 5) err(file, `${k} 必须是 1-5 数值`);
  }
  if (!Number.isInteger(m.child_count) || m.child_count < 0) err(file, 'child_count 必须是非负整数');
  if (typeof m.summary !== 'string' || !m.summary) err(file, 'summary 缺失');
  if (!existsSync(path.join(path.dirname(file), 'DESIGN.md'))) err(file, '缺少 DESIGN.md');
}

function scan(dir, validate) {
  const base = path.join(root, dir);
  if (!existsSync(base)) return [];
  const dirs = readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory());
  for (const d of dirs) {
    const metaFile = path.join(base, d.name, 'meta.json');
    if (!existsSync(metaFile)) {
      errors.push(`${dir}/${d.name}/meta.json: 文件不存在（红线 R4）`);
      continue;
    }
    let m;
    try {
      m = JSON.parse(readFileSync(metaFile, 'utf8'));
    } catch (e) {
      errors.push(`${dir}/${d.name}/meta.json: JSON 解析失败 — ${e.message}`);
      continue;
    }
    validate(metaFile.replaceAll('\\', '/').replace(root.replaceAll('\\', '/').replace(/\\/g, '') + '/', ''), m, d.name);
  }
  return dirs;
}

const pages = scan('generated/pages', validatePageMeta);
const styles = scan('generated/styles', validateStyleMeta);

if (errors.length) {
  console.error(`[FAIL] ${errors.length} 处元数据违规：`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`[OK] ${pages.length} 个页面、${styles.length} 个派生风格的 meta.json 全部合法。`);
