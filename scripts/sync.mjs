#!/usr/bin/env node
/**
 * sync.mjs — 本地生成后的同步入口：verify → validate → 选择性 git add/commit/push。
 * 用法：npm run sync -- ["提交信息"] [--dry]
 *   --dry：试运行，只列出将要提交与跳过的文件及自动生成的提交信息，不实际执行。
 *
 * 提交范围（策展人规则：未评分页面暂不推送）：
 *   - generated/pages/<id>/ 的变更：仅当该页面 meta.json 的 rating 为数字（已评分）才提交；
 *     未评分页面的所有变更留在工作区，待策展人评分后随下一轮 sync 推送。
 *   - generated/styles/ 与其余路径的变更：照常提交（派生风格仅能由评分 ≥ 4 的页面沉淀而来）。
 *
 * 提交信息（conventional commits，显式传入优先）：
 *   - 画廊内容（页面/风格）变更 → `content: 新增页面 X；沉淀派生风格 Y；更新页面 Z`
 *   - 仅平台文件变更         → `chore: 更新 <文件>`
 *   - 被跳过的未评分页面写入 message body，留档备查。
 *
 * verify / validate 任一失败立即中止，绝不提交违规状态（保护红线 R1/R4）。
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dry = process.argv.includes('--dry');

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: 'inherit' });
}

try {
  console.log('▶ 校验种子目录只读（红线 R1）…');
  run(`"${process.execPath}" "${path.join(root, 'scripts', 'verify-readonly.mjs')}"`);
  console.log('▶ 校验 meta.json 合法性（红线 R4）…');
  run(`"${process.execPath}" "${path.join(root, 'scripts', 'validate-meta.mjs')}"`);
} catch {
  console.error('\n[ABORT] 校验未通过，已取消同步。请修复后再试。');
  process.exit(1);
}

const status = execSync('git status --porcelain -uall', { cwd: root, encoding: 'utf8' });
if (!status.trim()) {
  console.log('[OK] 工作区无变更，无需同步。');
  process.exit(0);
}

const ratedCache = new Map();
function pageIsRated(pageId) {
  if (ratedCache.has(pageId)) return ratedCache.get(pageId);
  const metaFile = path.join(root, 'generated', 'pages', pageId, 'meta.json');
  let rated = false;
  if (existsSync(metaFile)) {
    try {
      rated = typeof JSON.parse(readFileSync(metaFile, 'utf8')).rating === 'number';
    } catch {
      rated = false;
    }
  }
  ratedCache.set(pageId, rated);
  return rated;
}

const toCommit = []; // { code, path }，code 为 porcelain 两字符状态码
const skipped = new Map(); // pageId -> 变更文件数
for (const line of status.split('\n')) {
  if (!line.trim()) continue;
  let p = line.slice(3);
  if (p.includes(' -> ')) p = p.split(' -> ').pop(); // 重命名取新路径
  const m = p.match(/^(?:\.\/)?generated\/pages\/([^/]+)/);
  if (m && !pageIsRated(m[1])) {
    skipped.set(m[1], (skipped.get(m[1]) ?? 0) + 1);
  } else {
    toCommit.push({ code: line.slice(0, 2), path: p });
  }
}

if (skipped.size) {
  console.log('\n⏸ 未评分页面按规则跳过（评分回填后随下一轮 sync 推送）：');
  for (const [pageId, n] of skipped) console.log(`  - ${pageId}（${n} 个文件变更，rating 未填写）`);
}

if (!toCommit.length) {
  console.log('\n[OK] 除未评分页面外没有可提交的变更，本次不同步。');
  process.exit(0);
}

// 按暂存内容生成 conventional commits 格式的提交信息（说明"干了什么"）
function autoMessage(items) {
  const newPages = new Set(), modPages = new Set(), newStyles = new Set(), modStyles = new Set(), others = new Set();
  for (const { code, path: p } of items) {
    const pm = p.match(/^(?:\.\/)?generated\/pages\/([^/]+)/);
    const sm = p.match(/^(?:\.\/)?generated\/styles\/([^/]+)/);
    if (pm) (code.includes('?') ? newPages : modPages).add(pm[1]);
    else if (sm) (code.includes('?') ? newStyles : modStyles).add(sm[1]);
    else others.add(p);
  }
  const parts = [];
  if (newPages.size) parts.push(`新增页面 ${[...newPages].join('、')}`);
  if (newStyles.size) parts.push(`沉淀派生风格 ${[...newStyles].join('、')}`);
  if (modPages.size) parts.push(`更新页面 ${[...modPages].join('、')}`); // 评分回填 / 状态流转
  if (modStyles.size) parts.push(`更新派生风格 ${[...modStyles].join('、')}`);
  if (others.size) parts.push(`更新 ${[...others].join('、')}`);
  const type = newPages.size || newStyles.size || modPages.size || modStyles.size ? 'content' : 'chore';
  return `${type}: ${parts.join('；')}`;
}

const subject =
  process.argv.slice(2).filter((a) => a !== '--dry' && a !== '--').join(' ').trim() ||
  autoMessage(toCommit);
const body = skipped.size
  ? `未评分页面按规则暂缓推送（待策展人评分后随下一轮 sync 提交）：${[...skipped.keys()].join('、')}`
  : '';

if (dry) {
  console.log(`\n[DRY] 试运行：以下 ${toCommit.length} 个变更将被提交（本次未实际执行）：`);
  for (const { path: p } of toCommit) console.log(`  ${p}`);
  console.log(`\n[DRY] 提交信息：\n  ${subject}`);
  if (body) console.log(`  body: ${body}`);
  process.exit(0);
}

run('git add -- ' + toCommit.map(({ path: p }) => JSON.stringify(p)).join(' '));
const commitArgs = ['-m', subject, ...(body ? ['-m', body] : [])];
run('git commit ' + commitArgs.map((s) => JSON.stringify(s)).join(' '));
try {
  run('git push');
} catch {
  console.error('[WARN] push 失败（远端未配置 / 网络 / 凭据问题）。本地提交已完成，稍后手动 git push 即可。');
  process.exit(1);
}
console.log(`\n[OK] 已同步到 GitHub：${subject}`);
