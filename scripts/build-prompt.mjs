#!/usr/bin/env node
/**
 * build-prompt.mjs — 拼装「完整提示词」= 生成规则模板 + 目标风格 DESIGN.md 全文。
 * 用法：
 *   npm run prompt -- stripe         # 种子风格（awesome-design-md/design-md/stripe）
 *   npm run prompt -- vinyl-noir-v1  # 派生风格（generated/styles/vinyl-noir-v1）
 * 输出到 stdout，并尽力复制到系统剪贴板（失败不影响，直接复制终端输出即可）。
 * 注意：模板文案与 README「访客复现指南」保持一致，改动需两处同步。
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const PLACEHOLDER = '<<< 在此处粘贴 DESIGN.md 全文 >>>';

const TEMPLATE = `你是一名资深 UI 设计 Agent。请严格按照下方《风格设计文档》的创作要求与规范，独立完成一个完整的页面设计。

## 创作任务

根据《风格设计文档》定义的设计语言，创作一个完整的页面。页面类型与主题行业由你根据风格气质自行拟定（除非我另有指定）。

## 硬性要求

1. 单文件自包含：所有 CSS 写在 <style> 内、JS 写在 <script> 内；外部资源仅允许 Google Fonts 等 CDN 字体。
2. 字体必须带系统回退栈，断网时不白屏。
3. 无外部图片：装饰一律用 CSS 绘制（渐变、阴影、伪元素、border 图形）。
4. 响应式三档断点：375px（mobile）/ 768px（tablet）/ 1280px（desktop），逐一处理；触控目标 ≥ 44px，文本不出现横向滚动。
5. 页面完整可浏览：导航、英雄区、至少 3 个内容区、页脚。
6. 严格遵循文档中的色彩角色、字体层级、组件样式、间距与阴影体系；任何偏离必须显式说明理由。

## 交付物

1. 一个完整的单文件 HTML 页面。
2. 一份简短设计说明：吸收了文档中的哪些 tokens、是否有偏离及理由。

## 风格设计文档

${PLACEHOLDER}
`;

const styleId = process.argv[2];
if (!styleId || !/^[A-Za-z0-9._-]+$/.test(styleId)) {
  console.error('用法：npm run prompt -- <风格id>');
  console.error('  种子风格 id 见 awesome-design-md/design-md/ 下的目录名（如 stripe）');
  console.error('  派生风格 id 见 generated/styles/ 下的目录名（如 vinyl-noir-v1）');
  process.exit(1);
}

const candidates = [
  { kind: '种子风格', file: path.join(root, 'awesome-design-md', 'design-md', styleId, 'DESIGN.md') },
  { kind: '派生风格', file: path.join(root, 'generated', 'styles', styleId, 'DESIGN.md') },
];
const hit = candidates.find((c) => existsSync(c.file));
if (!hit) {
  console.error(`[FAIL] 未找到风格「${styleId}」的 DESIGN.md（种子与派生目录均无）。`);
  process.exit(1);
}

const prompt = TEMPLATE.replace(PLACEHOLDER, readFileSync(hit.file, 'utf8').trim());
console.log(prompt);

try {
  const clipCmd =
    process.platform === 'win32' ? 'clip'
      : process.platform === 'darwin' ? 'pbcopy'
        : 'xclip -selection clipboard';
  execSync(clipCmd, { input: prompt, stdio: ['pipe', 'ignore', 'ignore'] });
  console.error(`\n[OK] 完整提示词已输出（来源：${hit.kind} ${styleId}），并已尝试复制到剪贴板。若粘贴出现乱码，请直接复制上方终端输出。`);
} catch {
  console.error(`\n[OK] 完整提示词已输出（来源：${hit.kind} ${styleId}）。请直接复制上方终端输出。`);
}
