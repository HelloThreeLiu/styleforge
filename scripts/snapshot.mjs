#!/usr/bin/env node
/**
 * snapshot.mjs — 为缺少截图的页面生成 1280×800 封面截图。
 * 用法：npm run snapshot [-- --force]  （--force 覆盖已有截图）
 * 依赖：根目录 npm install 后，首次需 `npx playwright install chromium`。
 */
import { readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pagesDir = path.join(root, 'generated', 'pages');
const force = process.argv.includes('--force');

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('[FAIL] playwright 未安装。请先在仓库根目录执行：');
  console.error('       npm install && npx playwright install chromium');
  process.exit(1);
}

if (!existsSync(pagesDir)) {
  console.error('[FAIL] 找不到 generated/pages 目录。');
  process.exit(1);
}

const targets = readdirSync(pagesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((id) => {
    const html = path.join(pagesDir, id, 'index.html');
    const shot = path.join(pagesDir, id, 'screenshot.png');
    return existsSync(html) && (force || !existsSync(shot));
  });

if (!targets.length) {
  console.log('[OK] 没有待截图的页面（全部已有截图，可用 --force 强制重截）。');
  process.exit(0);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

let done = 0;
for (const id of targets) {
  const dir = path.join(pagesDir, id);
  const url = 'file:///' + path.join(dir, 'index.html').replaceAll('\\', '/');
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  } catch {
    console.warn(`[WARN] ${id}: networkidle 超时，降级为 load 继续。`);
    await page.goto(url, { waitUntil: 'load', timeout: 30000 }).catch(() => {});
  }
  await page.waitForTimeout(600); // 等字体渲染稳定
  await page.screenshot({ path: path.join(dir, 'screenshot.png') });
  console.log(`[SHOT] ${id}`);
  done++;
}

await browser.close();
console.log(`[OK] 完成 ${done} 张截图。`);
