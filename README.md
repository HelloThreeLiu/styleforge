# StyleForge — Agent 驱动的 UI 设计平台

以 AI Agent 为生产力、人类为策展人的个人 UI 设计实验平台。完整需求见 [docs/PRD.md](docs/PRD.md)，Agent 行为宪法见 [AGENTS.md](AGENTS.md)。

## 在线画廊

**地址：<https://hellothreeliu.github.io/styleforge/>** —— 每次推送到 `main`，GitHub Actions 自动更新：

- 在线交互预览每个生成页面（页面均为单文件自包含 HTML，直接可浏览）；
- 查看截图、设计笔记、风格谱系与风格库；
- 画廊为纯静态站点：**没有评分入口**——浏览即可，打分不在此处（见「关于评分」）。

## 目录结构

```
awesome-design-md/     种子风格库（54 个 DESIGN.md，永久只读；来源见「种子库来源与致谢」）
generated/pages/       Agent 生成的页面（每页：index.html + meta.json + notes.md + screenshot.png）
generated/styles/      派生风格（高评分页面沉淀出的新 DESIGN.md）
web/                   Web 平台（Next.js 画廊 / 预览 / 打标评分；仅策展人本地运行，不部署公网）
scripts/               verify / validate / snapshot / round / promote / sync / prompt / gallery
schema/                meta.json 的 JSON Schema（唯一真源）
.github/workflows/     Pages 画廊自动发布工作流
```

## 快速开始（策展人本地）

```bash
# 1. 安装依赖
npm install && cd web && npm install && cd ..
npx playwright install chromium   # 截图用，仅首次

# 2. 启动 Web 平台（默认 http://localhost:3000，评分功能仅在此处）
npm run web

# 3. 校验与同步
npm run verify      # 校验种子目录零变更（红线 R1）
npm run validate    # 校验所有 meta.json 合法（红线 R4）
npm run snapshot    # 为缺截图的页面生成封面（--force 强制重截）
npm run sync        # 一轮生成后的同步：verify → validate → git commit → push（GitHub 随之更新）

# 4. 提示词与画廊
npm run prompt -- stripe    # 拼装任意风格的完整复现提示词（输出并尝试复制到剪贴板）
npm run gallery             # 本地预览 Pages 画廊构建结果（输出到 _site/，已 gitignore）
```

## 访客复现指南：用提示词生成同风格页面

无需克隆运行整个平台，只要一个任意 AI 编码 Agent（ZCode、Claude Code、Cursor 等）加下面三步：

**第一步**，复制这份提示词模板：

```
你是一名资深 UI 设计 Agent。请严格按照下方《风格设计文档》的创作要求与规范，独立完成一个完整的页面设计。

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

<<< 在此处粘贴 DESIGN.md 全文 >>>
```

**第二步**，打开任意风格的 DESIGN.md（点 Raw 后全选复制）：

- 种子风格（54 个）：`awesome-design-md/design-md/<风格id>/DESIGN.md`，如 [stripe](awesome-design-md/design-md/stripe/DESIGN.md)、[linear.app](awesome-design-md/design-md/linear.app/DESIGN.md)
- 派生风格：`generated/styles/<风格id>/DESIGN.md`，如 [vinyl-noir-v1](generated/styles/vinyl-noir-v1/DESIGN.md)

**第三步**，把 DESIGN.md 全文粘贴到模板占位处，整体发给你的 AI——即可得到同风格的全新页面。

> 克隆了仓库的话，`npm run prompt -- <风格id>` 一步完成上述拼装。

## 关于评分

评分（1–5 星）与状态流转**只属于策展人**：在本地 Web 平台（`npm run web`）完成，写入 `meta.json` 的 `rating` 字段后随 git 提交同步到本仓库。访客克隆后即使本地修改评分也无法推送回流——官方评分以本仓库 `main` 分支为准。在线画廊同样只读，没有任何评分入口。

## 种子库来源与致谢

`awesome-design-md/` 的 54 个风格设计文档来自开源项目 **[awesome-design-md](https://github.com/VoltAgent/awesome-design-md)**（VoltAgent 出品，MIT 协议）：

- 本仓库经由其 gitee 镜像（gitee.com/leroylau/awesome-design-md）克隆获得，内容对应镜像提交 `76bde6c`（2026-04-03）；
- 为并入本仓库统一管理，已移除其嵌套 `.git`、吸收为普通目录；`npm run verify` 改由主仓库监控该目录的只读状态（红线 R1 语义不变）；
- 种子内容的版权归上游所有；如需跟进上游更新，可另行克隆上游仓库后与 `awesome-design-md/` 对比合并。

## 召唤 Agent 创作页面

### 方式一：一条命令的自动学习（推荐）

对 Agent 说：

```
执行一轮学习
```

Agent 将按 AGENTS.md §11 自主完成全流程，无需任何补充指令：

1. **沉淀**：把所有「已发布且评分 ≥ 4」的历史页面逐个逆向提炼为派生风格（published → promoted，单轮最多 3 个，其余顺延）；
2. **学习**：从白名单（54 个种子 + 评分 ≥ 4 的派生风格）随机抽取 **2 个不同风格**（自动避开最近 8 个页面用过的风格），各生成 1 个页面；
3. **收尾**：自动补截图、跑只读与元数据校验、汇报产出路径。

### 方式二：精确指派

在任何编码 Agent 会话（如 ZCode）中说：

```
学习 awesome-design-md/design-md/stripe/DESIGN.md（遵守 AGENTS.md），
做一个 fintech SaaS 落地页。
```

生成完成后运行 `npm run snapshot` 补截图，页面自动出现在画廊。

### 相关命令

```bash
npm run round      # 查看下一轮的执行计划（沉淀候选 + 随机双风格）
npm run promote -- <page-id> <style-id>   # 派生风格登记 + 状态流转
```

## 沉淀派生风格（进化闭环）

1. 在 Web 详情页给页面打 ≥ 4 分
2. 召唤 Agent：「把 generated/pages/<page-id> 沉淀为派生风格」（走 AGENTS.md §10 协议）
3. 新风格出现在 风格库 → 派生风格，可被后续 Agent 学习

## 三种创作模式

| origin | 含义 | lineage |
|---|---|---|
| `study` | 复刻单一种子风格 | 恰好 1 项 |
| `remix` | 多风格混血 | ≥ 2 项 |
| `original` | 自创设计语言 | 空数组 |

## License

平台代码与 Agent 生成内容以 [MIT](LICENSE) 发布；`awesome-design-md/` 种子内容版权归 [上游](https://github.com/VoltAgent/awesome-design-md)所有（同为 MIT）。
