#!/usr/bin/env node
/**
 * round-plan.mjs — 生成"一轮学习"的执行计划（供 Agent 按 AGENTS.md §11 执行）。
 *
 * 阶段一（沉淀候选）：status == "published" 且 rating >= 4，且尚无派生风格指向它的页面。
 *   单轮最多沉淀 3 个，其余顺延下一轮。
 * 阶段二（随机学习）：从白名单（54 个种子 + rating >= 4 的派生风格）随机抽取 2 个
 *   不同风格（避开最近 8 个页面已使用的风格，池不足时回退全量），并附页面类型/行业建议。
 * 附带输出：pending_rating（rating 为 null 的待评分页面）与 rated_below_threshold（已评分但 <4），
 *   供收尾汇报直接引用，杜绝手工枚举出错——已评分页面绝不计入待评分。
 *
 * 用法：node scripts/round-plan.mjs [--json]
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const PAGES_DIR = path.join(root, 'generated', 'pages');
const STYLES_DIR = path.join(root, 'generated', 'styles');
const SEED_DIR = path.join(root, 'awesome-design-md', 'design-md');

const PAGE_TYPES = ['landing', 'dashboard', 'pricing', 'portfolio', 'blog', 'docs', 'login', 'e-commerce', 'settings', 'marketing'];
const INDUSTRIES = ['fintech', 'dev-tool', 'ai', 'travel', 'health', 'education', 'social', 'media', 'enterprise', 'consumer'];
const PROMOTE_CAP = 3;
const RECENT_WINDOW = 8;

const asJson = process.argv.includes('--json');

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function dirsOf(base) {
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pages = dirsOf(PAGES_DIR).map((dir) => ({ dir, meta: readJson(path.join(PAGES_DIR, dir, 'meta.json')) }));
const derived = dirsOf(STYLES_DIR).map((dir) => ({ dir, meta: readJson(path.join(STYLES_DIR, dir, 'meta.json')) }));
const seeds = dirsOf(SEED_DIR);

// —— 阶段一：沉淀候选 ——
const promotedSources = new Set(derived.map((d) => d.meta?.source_page).filter(Boolean));
const promoteAll = pages.filter(
  (p) => p.meta && p.meta.status === 'published' && typeof p.meta.rating === 'number' && p.meta.rating >= 4 && !promotedSources.has(p.meta.id ?? p.dir)
);
const promote = promoteAll.slice(0, PROMOTE_CAP).map((p) => ({
  page: p.meta.id ?? p.dir,
  dir: p.dir,
  title: p.meta.title,
  rating: p.meta.rating,
  lineage: p.meta.lineage ?? [],
}));

// —— 待评分 / 已评分未达沉淀线（收尾汇报引用，禁止凭记忆枚举）——
const pendingRating = pages
  .filter((p) => p.meta && p.meta.rating == null)
  .map((p) => ({ page: p.meta.id ?? p.dir, title: p.meta.title, status: p.meta.status }));
const ratedBelow = pages
  .filter((p) => p.meta && typeof p.meta.rating === 'number' && p.meta.rating < 4 && p.meta.status !== 'archived')
  .map((p) => ({ page: p.meta.id ?? p.dir, title: p.meta.title, rating: p.meta.rating, status: p.meta.status }));

// —— 阶段二：随机抽取两个风格 ——
const pool = [
  ...seeds.map((name) => ({ id: name, kind: 'seed' })),
  ...derived.filter((d) => d.meta && typeof d.meta.rating === 'number' && d.meta.rating >= 4).map((d) => ({ id: d.dir, kind: 'derived' })),
];

const recent = [...pages]
  .sort((a, b) => String(b.meta?.created_at ?? '').localeCompare(String(a.meta?.created_at ?? '')))
  .slice(0, RECENT_WINDOW);
const recentLineages = new Set(recent.flatMap((p) => p.meta?.lineage ?? []));

let candidates = pool.filter((s) => !recentLineages.has(s.id));
if (candidates.length < 2) candidates = pool;

const picked = shuffle(candidates).slice(0, 2);
const types = shuffle(PAGE_TYPES);
const industries = shuffle(INDUSTRIES);
const picks = picked.map((s, i) => ({ ...s, suggest_page_type: types[i], suggest_industry: industries[i] }));

const plan = {
  round_at: new Date().toISOString(),
  promote,
  promote_deferred: Math.max(0, promoteAll.length - promote.length),
  pending_rating: pendingRating,
  rated_below_threshold: ratedBelow,
  pool_size: pool.length,
  recent_excluded: [...recentLineages],
  picks,
};

if (asJson) {
  console.log(JSON.stringify(plan, null, 2));
} else {
  console.log('=== 一轮学习计划（按 AGENTS.md §11 执行）===');
  console.log(`\n[阶段一 · 沉淀] 已发布且评分≥4 的候选：${promote.length} 个（顺延 ${plan.promote_deferred} 个）`);
  if (promote.length === 0) console.log('  （无候选——上一轮没有达标页面，跳过沉淀）');
  for (const p of promote) console.log(`  - ${p.page}  ${p.title}  ★${p.rating}  lineage: ${p.lineage.join(' × ') || '无'}`);
  console.log(`\n[阶段二 · 学习] 白名单 ${pool.length} 个风格（${seeds.length} 种子 + ${pool.length - seeds.length} 派生），随机抽取 2 个：`);
  picks.forEach((p, i) => {
    console.log(`  ${i + 1}. [${p.kind === 'seed' ? '种子' : '派生'}] ${p.id}`);
    console.log(`     DESIGN.md: ${p.kind === 'seed' ? `awesome-design-md/design-md/${p.id}/DESIGN.md` : `generated/styles/${p.id}/DESIGN.md`}`);
    console.log(`     建议页面类型: ${p.suggest_page_type} · 建议行业: ${p.suggest_industry}`);
  });
  console.log(`\n[待评分提醒] rating 为 null 的页面：${pendingRating.length} 个（收尾汇报的待评分清单 = 此清单 + 本轮新生成页面）`);
  if (!pendingRating.length) console.log('  （无——画廊无积压）');
  for (const p of pendingRating) console.log(`  - ${p.page}  ${p.title}（${p.status}）`);
  console.log(`[已评分未达沉淀线 <4] ${ratedBelow.length} 个（已评分，不属于待评分）：`);
  for (const p of ratedBelow) console.log(`  - ${p.page}  ${p.title}  ★${p.rating}（${p.status}）`);
  console.log('\n下一步：沉淀候选逐一走 §10 协议（完成后 npm run promote -- <page-id> <style-id>）；');
  console.log('再按抽取结果各生成 1 个 study 页面（两页类型/主题不得雷同），最后 npm run snapshot && npm run verify && npm run validate && npm run sync（sync 会自动跳过未评分的新页面）。');
}
