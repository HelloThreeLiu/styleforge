#!/usr/bin/env node
/**
 * sync.mjs — 本地生成后的同步入口：verify → validate → git add/commit/push。
 * 用法：npm run sync -- "提交信息"（信息可省略，自动生成）
 * verify / validate 任一失败立即中止，绝不提交违规状态（保护红线 R1/R4）。
 */
import { execSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

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

const status = execSync('git status --porcelain', { cwd: root, encoding: 'utf8' });
if (!status.trim()) {
  console.log('[OK] 工作区无变更，无需同步。');
  process.exit(0);
}

const changed = status.trim().split('\n').length;
const msg =
  process.argv.slice(2).join(' ').trim() ||
  `sync: ${changed} 个文件变更 (${new Date().toISOString().slice(0, 10)})`;

run('git add -A');
run('git commit -m ' + JSON.stringify(msg));
try {
  run('git push');
} catch {
  console.error('[WARN] push 失败（远端未配置 / 网络 / 凭据问题）。本地提交已完成，稍后手动 git push 即可。');
  process.exit(1);
}
console.log(`\n[OK] 已同步到 GitHub：${msg}`);
