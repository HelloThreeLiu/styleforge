#!/usr/bin/env node
/**
 * promote-register.mjs — 派生风格登记与状态流转（AGENTS.md §10/§11 配套）。
 *
 * 用法：npm run promote -- <page-id> <style-id>
 *
 * 校验：
 *   1. generated/styles/<style-id>/ 必须已存在 DESIGN.md + meta.json，且 meta.source_page === <page-id>
 *   2. 源页面 meta.json 必须存在，且 status 为 published（幂等：已 promoted 则直接通过）
 * 动作：把源页面 status 置为 promoted，原子写回。
 */
import { readFileSync, writeFileSync, renameSync, copyFileSync, rmSync } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

const [, , pageId, styleId] = process.argv;
if (!pageId || !styleId) {
  console.error('用法：npm run promote -- <page-id> <style-id>');
  process.exit(1);
}

const styleDir = path.join(root, 'generated', 'styles', styleId);
const styleMetaFile = path.join(styleDir, 'meta.json');
const pageMetaFile = path.join(root, 'generated', 'pages', pageId, 'meta.json');

let failed = false;
const fail = (msg) => {
  console.error(`[FAIL] ${msg}`);
  failed = true;
};

if (!existsSync(path.join(styleDir, 'DESIGN.md'))) fail(`${styleDir} 缺少 DESIGN.md`);
let styleMeta = null;
if (existsSync(styleMetaFile)) {
  try {
    styleMeta = JSON.parse(readFileSync(styleMetaFile, 'utf8'));
  } catch (e) {
    fail(`派生风格 meta.json 解析失败：${e.message}`);
  }
} else {
  fail(`${styleMetaFile} 不存在`);
}
if (styleMeta && styleMeta.source_page !== pageId) {
  fail(`派生风格 meta.source_page "${styleMeta.source_page}" 与待登记页面 "${pageId}" 不一致`);
}

if (!existsSync(pageMetaFile)) {
  fail(`源页面 ${pageMetaFile} 不存在`);
} else {
  let pageMeta;
  try {
    pageMeta = JSON.parse(readFileSync(pageMetaFile, 'utf8'));
  } catch (e) {
    fail(`源页面 meta.json 解析失败：${e.message}`);
    pageMeta = null;
  }
  if (pageMeta) {
    if (pageMeta.status === 'promoted') {
      console.log(`[OK] ${pageId} 已是 promoted 状态，无需重复登记。`);
      process.exit(failed ? 1 : 0);
    }
    if (pageMeta.status !== 'published') {
      fail(`源页面 status 为 "${pageMeta.status}"，仅 published 状态可沉淀（先在 Web 平台发布并评分≥4）`);
    }
    if (!(typeof pageMeta.rating === 'number' && pageMeta.rating >= 4)) {
      fail(`源页面评分为 ${pageMeta.rating}，需 ≥ 4 才可沉淀`);
    }
    if (!failed) {
      pageMeta.status = 'promoted';
      const tmp = pageMetaFile + '.tmp';
      writeFileSync(tmp, JSON.stringify(pageMeta, null, 2) + '\n', 'utf8');
      try {
        renameSync(tmp, pageMetaFile);
      } catch {
        copyFileSync(tmp, pageMetaFile);
        rmSync(tmp);
      }
      console.log(`[OK] 沉淀登记完成：${pageId} → ${styleId}（status: published → promoted）`);
    }
  }
}

process.exit(failed ? 1 : 0);
