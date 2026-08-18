#!/usr/bin/env node
/**
 * build-gallery.mjs — 零依赖静态画廊构建器（GitHub Pages 用，本地亦可预览）。
 * 扫描 generated/pages、generated/styles、awesome-design-md/design-md，
 * 产出只读站点：无评分 UI、无任何写操作。
 *
 * 用法：
 *   node scripts/build-gallery.mjs                      # 输出到 _site/（已 gitignore）
 *   GALLERY_OUTPUT=dist node scripts/build-gallery.mjs  # 自定义输出目录
 *
 * 环境变量 GITHUB_REPOSITORY（GitHub Actions 自动注入，形如 user/repo）：
 *   用于生成指向仓库内 DESIGN.md 的「复制提示词」链接；本地未设置时自动省略外链。
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.resolve(root, process.env.GALLERY_OUTPUT || '_site');
const repoSlug = process.env.GITHUB_REPOSITORY || null;

const blobUrl = (relPath) => (repoSlug ? `https://github.com/${repoSlug}/blob/main/${relPath}` : null);
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function readJsonSafe(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function listDirs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function styleTitle(dir, id) {
  const md = path.join(dir, 'DESIGN.md');
  if (!existsSync(md)) return id;
  const m = readFileSync(md, 'utf8').match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : id;
}

function lineageDoc(styleId) {
  const seed = `awesome-design-md/design-md/${styleId}/DESIGN.md`;
  const derived = `generated/styles/${styleId}/DESIGN.md`;
  if (existsSync(path.join(root, seed))) return seed;
  if (existsSync(path.join(root, derived))) return derived;
  return null;
}

// ---------- 数据 ----------

const pages = listDirs(path.join(root, 'generated', 'pages'))
  .map((id) => {
    const dir = path.join(root, 'generated', 'pages', id);
    const meta = readJsonSafe(path.join(dir, 'meta.json'));
    return meta ? { id, dir, meta } : null;
  })
  .filter(Boolean)
  .sort((a, b) => (a.meta.created_at < b.meta.created_at ? 1 : -1));

const derived = listDirs(path.join(root, 'generated', 'styles'))
  .map((id) => {
    const dir = path.join(root, 'generated', 'styles', id);
    return { id, dir, meta: readJsonSafe(path.join(dir, 'meta.json')) };
  })
  .filter(Boolean);

const seeds = listDirs(path.join(root, 'awesome-design-md', 'design-md'))
  .map((id) => {
    const dir = path.join(root, 'awesome-design-md', 'design-md', id);
    if (!existsSync(path.join(dir, 'DESIGN.md'))) return null;
    return { id, name: styleTitle(dir, id) };
  })
  .filter(Boolean)
  .sort((a, b) => a.id.localeCompare(b.id));

// ---------- 样式 ----------

const CSS = `
:root { color-scheme: dark; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif; background: #0e1116; color: #e6e9ef; line-height: 1.6; }
a { color: #8ea2ff; text-decoration: none; }
a:hover { text-decoration: underline; }
header.site { padding: 48px 24px 28px; max-width: 1200px; margin: 0 auto; }
header.site h1 { font-size: 28px; letter-spacing: 0.5px; }
header.site .sub { color: #9aa3b2; margin-top: 8px; font-size: 14px; }
header.site nav { margin-top: 14px; font-size: 14px; }
main { max-width: 1200px; margin: 0 auto; padding: 0 24px 56px; }
h2.section { font-size: 20px; margin: 36px 0 16px; }
h2.section .cnt { color: #6b7686; font-weight: 400; font-size: 14px; margin-left: 8px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
.card { background: #161b24; border: 1px solid #232b38; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: border-color 0.15s; }
.card:hover { border-color: #35415a; }
.card .shot { aspect-ratio: 8 / 5; width: 100%; display: block; object-fit: cover; object-position: top; border-bottom: 1px solid #232b38; background: #0b0d12; }
.card .shot.ph { display: flex; align-items: center; justify-content: center; color: #4b5563; font-size: 13px; }
.card .body { padding: 16px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
.card h2 { font-size: 16px; font-weight: 600; }
.card .id { font-family: Consolas, 'Courier New', monospace; font-size: 12px; color: #6b7686; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { font-size: 12px; padding: 2px 10px; border-radius: 999px; background: #1d2532; color: #a8b3c4; border: 1px solid #2a3444; }
.chip.origin { color: #8ea2ff; border-color: #35405c; }
.chip.rate { color: #ffce4d; border-color: #5c4a1e; }
.chip.st-published { color: #7fdca4; border-color: #24503a; }
.chip.st-promoted { color: #d5a8ff; border-color: #4b3070; }
a.chip:hover { text-decoration: none; border-color: #46536f; }
.card .links { margin-top: auto; padding-top: 4px; display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px; }
ul.style-list { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 8px; }
ul.style-list li { background: #161b24; border: 1px solid #232b38; border-radius: 8px; padding: 10px 14px; font-size: 14px; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
ul.style-list .id { font-family: Consolas, 'Courier New', monospace; font-size: 12px; color: #6b7686; }
ul.style-list .rate { color: #ffce4d; font-size: 12px; white-space: nowrap; }
.hint { background: #141a26; border: 1px dashed #2a3444; border-radius: 10px; padding: 14px 18px; color: #9aa3b2; font-size: 13px; margin: 20px 0; }
footer.site { max-width: 1200px; margin: 0 auto; padding: 22px 24px 40px; border-top: 1px solid #232b38; color: #6b7686; font-size: 13px; }
@media (max-width: 640px) { header.site { padding-top: 30px; } .grid { grid-template-columns: 1fr; } }
`;

// ---------- 渲染 ----------

function renderCard(p) {
  const m = p.meta;
  const chips = [`<span class="chip origin">${esc(m.origin)}</span>`];
  for (const l of m.lineage || []) {
    const doc = lineageDoc(l);
    const url = doc ? blobUrl(doc) : null;
    chips.push(
      url
        ? `<a class="chip" href="${esc(url)}" title="打开该风格 DESIGN.md（可复制为提示词）">${esc(l)}</a>`
        : `<span class="chip">${esc(l)}</span>`,
    );
  }
  if (m.page_type) chips.push(`<span class="chip">${esc(m.page_type)}</span>`);
  for (const ind of m.industry || []) chips.push(`<span class="chip">${esc(ind)}</span>`);
  if (m.status) chips.push(`<span class="chip st-${esc(m.status)}">${esc(m.status)}</span>`);
  if (m.rating != null) chips.push(`<span class="chip rate">★ ${esc(m.rating)}</span>`);

  const shot = existsSync(path.join(p.dir, 'screenshot.png'))
    ? `<img class="shot" src="pages/${esc(p.id)}/screenshot.png" alt="${esc(m.title)} 截图" loading="lazy">`
    : `<div class="shot ph">暂无截图</div>`;

  const noteLink = existsSync(path.join(p.dir, 'notes.md'))
    ? `<a href="pages/${esc(p.id)}/notes.md">设计笔记</a>`
    : '';
  const mainLineage = (m.lineage || [])[0];
  const promptUrl = mainLineage ? blobUrl(lineageDoc(mainLineage) || '') : null;
  const promptLink = promptUrl
    ? `<a href="${esc(promptUrl)}" title="打开所学风格的 DESIGN.md，配合仓库 README 的提示词模板即可复现同风格页面">复制提示词 ↗</a>`
    : '';

  return `<article class="card">
  <a href="pages/${esc(p.id)}/" target="_blank" rel="noopener">${shot}</a>
  <div class="body">
    <h2><a href="pages/${esc(p.id)}/" target="_blank" rel="noopener">${esc(m.title)}</a></h2>
    <span class="id">${esc(m.id)}</span>
    <div class="chips">${chips.join('')}</div>
    <div class="links">
      <a href="pages/${esc(p.id)}/" target="_blank" rel="noopener">在线预览</a>
      ${noteLink}
      ${promptLink}
    </div>
  </div>
</article>`;
}

function layout({ title, active, body }) {
  const nav = `<nav><a href="${active === 'gallery' ? '#' : '../'}" ${active === 'gallery' ? 'aria-current="page"' : ''}>画廊</a> · <a href="${active === 'styles' ? '#' : 'styles/'}" ${active === 'styles' ? 'aria-current="page"' : ''}>风格库</a>${repoSlug ? ` · <a href="https://github.com/${esc(repoSlug)}">GitHub 仓库</a>` : ''}</nav>`;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)} · StyleForge</title>
<style>${CSS}</style>
</head>
<body>
<header class="site">
  <h1>StyleForge</h1>
  <p class="sub">Agent 生成 · 人类策展 · 只读画廊（评分仅在策展人本地进行，本站无任何评分入口）</p>
  ${nav}
</header>
<main>
${body}
</main>
<footer class="site">由 StyleForge 平台自动构建 · 种子风格来自 <a href="https://github.com/VoltAgent/awesome-design-md" rel="noopener">VoltAgent/awesome-design-md</a>（MIT）</footer>
</body>
</html>
`;
}

function renderIndex() {
  const cards = pages.map(renderCard).join('\n');
  return layout({
    title: '画廊',
    active: 'gallery',
    body: `<h2 class="section">生成页面<span class="cnt">${pages.length} 个，按时间倒序</span></h2>
${pages.length ? `<div class="grid">\n${cards}\n</div>` : '<p>暂无页面。</p>'}
<div class="hint">想用同样的风格生成你自己的页面？点击卡片上的风格标签或「复制提示词」打开对应 DESIGN.md，配合 <a href="${repoSlug ? `https://github.com/${esc(repoSlug)}#访客复现指南` : '#'}">README 的提示词模板</a>发给任意 AI 即可复现。</div>`,
  });
}

function renderStyles() {
  const seedItems = seeds
    .map((s) => {
      const url = blobUrl(`awesome-design-md/design-md/${s.id}/DESIGN.md`);
      const name = url ? `<a href="${esc(url)}">${esc(s.name)}</a>` : esc(s.name);
      return `<li><span>${name}</span><span class="id">${esc(s.id)}</span></li>`;
    })
    .join('\n');
  const derivedItems = derived
    .map((d) => {
      const url = blobUrl(`generated/styles/${d.id}/DESIGN.md`);
      const name = d.meta?.name || d.id;
      const label = url ? `<a href="${esc(url)}">${esc(name)}</a>` : esc(name);
      const rate = d.meta?.inherited_rating != null ? `<span class="rate">继承 ★ ${esc(d.meta.inherited_rating)}</span>` : '';
      return `<li><span>${label}<span class="id">${esc(d.id)}</span></span>${rate}</li>`;
    })
    .join('\n');
  return layout({
    title: '风格库',
    active: 'styles',
    body: `<h2 class="section">派生风格<span class="cnt">${derived.length} 个（高评分页面沉淀而来）</span></h2>
${derived.length ? `<ul class="style-list">\n${derivedItems}\n</ul>` : '<p>暂无派生风格。</p>'}
<h2 class="section">种子风格<span class="cnt">${seeds.length} 个（来自 awesome-design-md）</span></h2>
<ul class="style-list">
${seedItems}
</ul>`,
  });
}

// ---------- 构建 ----------

rmSync(outDir, { recursive: true, force: true });
mkdirSync(path.join(outDir, 'pages'), { recursive: true });

for (const p of pages) {
  const dest = path.join(outDir, 'pages', p.id);
  mkdirSync(dest, { recursive: true });
  for (const f of ['index.html', 'screenshot.png', 'notes.md']) {
    if (existsSync(path.join(p.dir, f))) cpSync(path.join(p.dir, f), path.join(dest, f));
  }
}

writeFileSync(path.join(outDir, 'index.html'), renderIndex());
mkdirSync(path.join(outDir, 'styles'), { recursive: true });
writeFileSync(path.join(outDir, 'styles', 'index.html'), renderStyles());

console.log(
  `[OK] 画廊已构建：${path.relative(root, outDir)}（${pages.length} 个页面 / ${derived.length} 个派生风格 / ${seeds.length} 个种子风格）`,
);
console.log(repoSlug ? `    仓库链接前缀：https://github.com/${repoSlug}/blob/main/` : '    未设置 GITHUB_REPOSITORY，仓库外链已省略（本地预览模式）。');
