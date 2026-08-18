#!/usr/bin/env node
/**
 * verify-readonly.mjs — 校验种子风格目录 awesome-design-md 零变更（红线 R1）。
 * 原理：awesome-design-md 已吸收为主仓库的普通目录，用主仓库 git status 监控该路径，
 * 任何未提交变更（新增/修改/删除）都视为违规。
 * 退出码：0 = 干净；1 = 检测到违规写入或无法校验。
 */
import { execSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

try {
  execSync('git rev-parse --is-inside-work-tree', { cwd: root, encoding: 'utf8', stdio: 'pipe' });
} catch {
  console.error(`[FAIL] ${root} 不是 git 仓库，无法校验只读状态。`);
  console.error('       请先初始化主仓库（git init）并完成首次提交。');
  process.exit(1);
}

let ok = true;

try {
  const status = execSync('git status --porcelain -- awesome-design-md', { cwd: root, encoding: 'utf8' });
  if (status.trim()) {
    ok = false;
    console.error('[FAIL] 种子风格目录被修改，以下文件出现未提交变更：');
    for (const line of status.split('\n')) {
      if (line.trim()) console.error('  ' + line);
    }
    console.error('\n红线 R1：awesome-design-md/ 永久只读。请还原这些变更（git restore / git clean）。');
  } else {
    console.log('[OK] awesome-design-md 零变更，红线 R1 通过。');
  }
} catch (err) {
  console.error('[FAIL] git status 执行失败：', err.message);
  process.exit(1);
}

process.exit(ok ? 0 : 1);
