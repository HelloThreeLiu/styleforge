#!/usr/bin/env node
/**
 * sync.mjs — 本地生成后的同步入口：verify → validate → 选择性 git add/commit/push。
 * 用法：npm run sync -- "提交信息" [--dry]
 *   --dry：试运行，只列出将要提交与跳过的文件，不实际暂存/提交/推送。
 *
 * 提交范围（策展人规则：未评分页面暂不推送）：
 *   - generated/pages/<id>/ 的变更：仅当该页面 meta.json 的 rating 为数字（已评分）才提交；
 *     未评分页面的所有变更留在工作区，待策展人评分后随下一轮 sync 推送。
 *   - generated/styles/ 与其余路径的变更：照常提交（派生风格仅能由评分 ≥ 4 的页面沉淀而来）。
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

const toCommit = [];
const skipped = new Map(); // pageId -> 变更文件数
for (const line of status.split('\n')) {
  if (!line.trim()) continue;
  let p = line.slice(3);
  if (p.includes(' -> ')) p = p.split(' -> ').pop(); // 重命名取新路径
  const m = p.match(/^(?:\.\/)?generated\/pages\/([^/]+)/);
  if (m && !pageIsRated(m[1])) {
    skipped.set(m[1], (skipped.get(m[1]) ?? 0) + 1);
  } else {
    toCommit.push(p);
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

if (dry) {
  console.log(`\n[DRY] 试运行：以下 ${toCommit.length} 个变更将被提交（本次未实际执行）：`);
  for (const p of toCommit) console.log(`  ${p}`);
  process.exit(0);
}

const msg =
  process.argv.slice(2).filter((a) => a !== '--dry').join(' ').trim() ||
  `sync: ${toCommit.length} 个文件变更 (${new Date().toISOString().slice(0, 10)})`;

run('git add -- ' + toCommit.map((p) => JSON.stringify(p)).join(' '));
run('git commit -m ' + JSON.stringify(msg));
try {
  run('git push');
} catch {
  console.error('[WARN] push 失败（远端未配置 / 网络 / 凭据问题）。本地提交已完成，稍后手动 git push 即可。');
  process.exit(1);
}
console.log(`\n[OK] 已同步到 GitHub：${msg}`);
