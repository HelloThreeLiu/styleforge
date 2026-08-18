# PRD：Agent 驱动的 UI 设计平台（StyleForge）

| 项目 | 内容 |
|---|---|
| 文档版本 | v0.1（草案，待评审） |
| 日期 | 2026-08-18 |
| 产品状态 | 待开发 |
| 读者 | 产品负责人（本人）、参与实现的 AI Agent、后续协作者 |

---

## 1. 执行摘要

StyleForge 是一个**以 AI Agent 为第一生产力、以人类为策展人**的个人 UI 设计实验平台。它的核心资产是开源项目 [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) 提供的 54 份 DESIGN.md 风格文档（Stripe、Linear、Vercel、Notion 等真实网站的设计系统提炼）。

平台运转在一个简单的双角色循环上：

1. **生成（Agent 负责）**：用户在任意时刻手动召唤一个 AI Agent（如 ZCode 会话），指令它"学习某个风格并创作一个页面"。Agent 受仓库根部规则文件 `AGENTS.md` 约束——**只读**原始风格目录，**只写**平台产出目录，每个页面附带结构化元数据与 AI 预打标签。
2. **策展（人类负责）**：用户在 Web 平台上浏览所有生成页面（含原始风格预览），打标签、评分、归类。

平台的差异化在于**进化闭环**：高评分页面可被提炼为"派生风格"（新的 DESIGN.md），成为后续 Agent 的学习范本。久而久之，平台从"复刻 54 个公网风格"成长为"拥有自己审美谱系的自有风格库"，且每一步谱系（lineage）可追溯。

MVP 形态：零账号体系、纯文件系统存储、本地运行的 Next.js Web 应用 + 一份约束所有 Agent 的规则文件。

---

## 2. 背景与问题陈述

### 2.1 背景

- [DESIGN.md](https://stitch.withgoogle.com/docs/design-md/overview/) 是 Google Stitch 提出的纯文本设计系统格式，是 LLM 最易消化的设计规范载体。awesome-design-md 已将 54 个知名网站提炼为此格式，每个风格包含：
  - `DESIGN.md`：9 大章节的设计系统（视觉主题、色彩角色、字体规则、组件样式、布局原则、阴影层级、Do's & Don'ts、响应式策略、Agent 提示词指南）
  - `preview.html` / `preview-dark.html`：浅色/深色双主题可视化目录
- AI Agent（编码类）已具备"读 DESIGN.md → 产出符合规范的完整 HTML 页面"的能力，但缺乏一个**可持续积累、可检索、可评价**的承载环境。

### 2.2 问题

当前缺失的东西：

1. **无规则约束**：Agent 直接在任意目录生成文件，产出散落、无法沉淀，还可能污染风格源文件。
2. **无浏览与检索**：生成的页面只能靠文件管理器一个个打开，没有画廊、筛选、对比。
3. **无评价与归类**：好页面和差页面混在一起，没有标签体系和评分来区分"哪些成功了"。
4. **无进化机制**：即使某次生成极成功，这份"成功"也无法被下一次生成复用——风格知识是单向消耗的，不是资产。

### 2.3 目标状态

一个本地运行的平台：召唤 Agent → 页面自动登记进画廊 → 浏览打标评分 → 优质页面反哺风格库 → 风格库越来越有"自己的味道"。

---

## 3. 产品目标与非目标

### 3.1 目标（Goals）

| # | 目标 | 衡量方式 |
|---|---|---|
| G1 | 建立带红线的 Agent 生成规则，源风格零污染 | 源目录 git status 始终干净 |
| G2 | 每次生成自动登记元数据，画廊零手工录入 | 新页面生成后无需任何手工配置即可出现在画廊 |
| G3 | 提供低摩擦的人工策展体验（打标/评分/归类） | 单个页面完成策展 < 30 秒 |
| G4 | 实现进化闭环：高分页面可沉淀为派生风格并被再学习 | 至少 1 个派生风格产生 ≥1 个后代页面 |
| G5 | 全程可追溯：任何页面能回答"它从哪来、学的谁" | lineage 字段覆盖率 100% |

### 3.2 非目标（Non-Goals / Out of Scope，MVP 明确不做）

- 多用户账号、权限、登录体系（个人实验场定位）
- 在线编辑生成页面的代码（页面由 Agent 重新生成，而非人工修补）
- 定时自动生成（列入二期，见里程碑）
- 公开部署与分享、评论系统
- 修改原始 54 个风格的内容（永久红线，不仅是 MVP）
- 图片/素材资产管理（页面仅允许占位图、CSS 绘制与外链字体）

---

## 4. 用户与角色

| 角色 | 是谁 | 职责 | 使用界面 |
|---|---|---|---|
| **策展人（Curator）** | 平台所有者（本人） | 召唤 Agent、下达创作指令；浏览、打标、评分、归类；发起"沉淀为风格" | CLI/Agent 会话 + Web 平台 |
| **生成者（Generator）** | 被召唤的 AI Agent | 学习 DESIGN.md → 产出页面 + 元数据 + AI 预打标签；提炼派生风格 DESIGN.md | 文件系统 + 规则文件 |
| **访客（Viewer）** | 本地浏览器使用者（通常=策展人） | 只读浏览画廊与风格库 | Web 平台 |

> 本产品没有传统意义上的"终端用户"，Web 平台的首要服务对象是**策展人的眼睛**，其次才是展示。

---

## 5. 核心概念与术语

| 术语 | 定义 |
|---|---|
| **种子风格（Seed Style）** | `awesome-design-md/design-md/` 下的 54 个原始风格，**永久只读**。 |
| **派生风格（Derived Style）** | 从高评分生成页面提炼出的新 DESIGN.md，存于产出目录，可再被学习。 |
| **页面条目（Page Entry）** | 一次生成动作的完整产物：自包含 HTML + meta.json + 设计笔记 + 截图。 |
| **谱系（Lineage）** | 页面→所学风格（种子或派生）的溯源链，支持混血（多父本）。 |
| **创作模式（Origin）** | 三种：`study`（单风格复刻）、`remix`（多风格混血）、`original`（不依赖种子的大胆原创）。 |
| **AGENTS.md** | 仓库根部的规则文件，约束所有被召唤 Agent 的读写边界与产出规范。 |
| **策展动作** | 打标签、评分（1–5）、归类（页面类型/行业）、状态流转（draft→published→promoted/archived）。 |
| **沉淀（Promote）** | 将高分页面提炼为派生风格的动作，由一次专门的 Agent 召唤完成。 |

---

## 6. 总体方案：四层架构

```
┌─────────────────────────────────────────────────────────┐
│  展示层  Web 平台（Next.js，本地运行）                      │
│  画廊 / 详情预览 / 打标评分 / 风格库 / 谱系                  │
├─────────────────────────────────────────────────────────┤
│  生成层  AI Agent（手动召唤，受 AGENTS.md 约束）             │
│  学习 DESIGN.md → 生成页面 → 自检 → 登记 → （受命时）提炼风格 │
├─────────────────────────────────────────────────────────┤
│  数据层  纯文件系统（Git 版本化）                           │
│  generated/pages/*  generated/styles/*  meta.json        │
├─────────────────────────────────────────────────────────┤
│  资产层  awesome-design-md（种子风格，只读）                 │
└─────────────────────────────────────────────────────────┘
```

数据流（单向为主，闭环为辅）：

```
种子风格 ──学习──▶ Agent ──生成──▶ 页面条目 ──策展──▶ 标签/评分
                     ▲                                   │
                     └──────再学习──── 派生风格 ◀──沉淀────┘
```

---

## 7. 目录结构规范（P0）

```
UI-Design-Platform/
├── awesome-design-md/            # [只读] 种子风格库（上游开源项目）
│   └── design-md/<style>/        #   54 个风格：DESIGN.md + preview*.html
├── generated/                    # [Agent 唯一可写区] 所有产出
│   ├── pages/                    #   页面条目
│   │   └── <page-id>/            #     如 20260818-stripe-fintech-landing
│   │       ├── index.html        #     自包含单文件页面
│   │       ├── meta.json         #     元数据（见 §9）
│   │       ├── notes.md          #     设计笔记（Agent 必写）
│   │       └── screenshot.png    #     截图（脚本生成，Agent 不写）
│   └── styles/                   #   派生风格
│       └── <style-id>/           #     如 neon-brutalism-v1
│           ├── DESIGN.md         #     Agent 提炼的新风格文档
│           └── meta.json         #     来源页面、评分等溯源信息
├── web/                          # Web 平台应用（Next.js）
├── scripts/                      # 截图、只读校验等工具脚本
├── docs/                         # 本 PRD 及后续文档
└── AGENTS.md                     # Agent 规则文件（生成层宪法）
```

**命名规范**：

- `<page-id>`：`YYYYMMDD-<seed-or-topic>-<page-type>[-序号]`，仅 `[a-z0-9-]`，如 `20260818-linear-saas-pricing`。
- `<style-id>`：`<风格名>-v<主版本>`，如 `warm-brutalism-v1`。
- 禁止中文与空格（避免 Windows/URL 兼容问题）；标题等展示字段放 meta.json，可用中文。

**红线（由 AGENTS.md 声明 + 脚本校验）**：

1. `awesome-design-md/` 下任何文件不得新增、修改、删除。
2. Agent 不得写入 `generated/` 之外的任何目录（`web/`、`docs/`、`scripts/` 同样禁写）。
3. 不得覆盖已存在的页面目录；重做 = 新建新目录。
4. 校验手段：`scripts/verify-readonly.mjs` 对比源目录 git 状态，Web 平台启动时与每次生成自检时报告。

> 备选增强（P2）：将 `awesome-design-md/` 转为 git submodule，从机制上隔离提交历史。

---

## 8. 功能需求

优先级定义：**P0** = MVP 必须；**P1** = MVP 尽量带；**P2** = 二期。

### 8.1 Agent 规则文件（AGENTS.md）【P0】

**用户故事**

> 作为策展人，我在召唤任何 Agent 时，希望它自动读取并遵守 AGENTS.md，
> 这样我不必每次口头重复边界规则，且源风格库绝对安全。

**规则文件必须包含的章节（对文档内容的需求）**

| # | 章节 | 必须声明的约束 |
|---|---|---|
| 1 | 使命与角色 | 平台是什么、Agent 的双重职责（生成页面 / 提炼风格） |
| 2 | 硬性红线 | §7 的四条红线 + 违规后果（输出作废重做） |
| 3 | 学习协议 | 生成前必读目标风格 `DESIGN.md` 全文；`preview.html` 可选；学习来源白名单 = `awesome-design-md/design-md/*` + `generated/styles/*`（后者需评分 ≥4） |
| 4 | 创作模式 | `study` / `remix` / `original` 三模式的定义、允许的自由度、必须保留的风格基因 |
| 5 | 产出规范 | 目录命名、四件套文件（index.html / meta.json / notes.md / 留空 screenshot.png）、meta.json 完整 schema、单 HTML 自包含（样式脚本内联，仅允许字体走 CDN） |
| 6 | 设计笔记要求 | notes.md 必含三段：① 从 DESIGN.md 学到的核心决策 ② 本页面如何应用 ③ 有意偏离点及理由 |
| 7 | AI 预打标签 | 生成时必须填写的受控字段（页面类型/行业/情绪/创新度）+ ≥3 个自由标签 |
| 8 | 响应式底线 | 必须处理 375px / 768px / 1280px 三档断点，遵守源风格 Responsive Behavior 章节 |
| 9 | 退出自检清单 | 逐项核对：源目录未动 / meta 合法（可通过校验脚本）/ HTML 无内联外链依赖（字体除外）/ 三档断点已处理 / notes 三段完整 |
| 10 | 沉淀协议 | 收到"沉淀为风格"指令时的流程：读原页面 + 源 DESIGN.md → 逆向提炼新 DESIGN.md（遵循 Stitch 9 章节结构）→ 写入 `generated/styles/<id>/` 并登记溯源 |

**验收标准**

- [ ] 一个从未见过本仓库的 Agent，仅凭 AGENTS.md + 用户一句话指令即可完成合规生成。
- [ ] AGENTS.md 中每条红线都有可执行的校验方式（人工 git diff 或脚本）。
- [ ] 校验脚本对故意违规的写入能报错退出（非零退出码）。

### 8.2 页面生成工作流【P0】

**用户故事**

> 作为策展人，我说"学习 Stripe 风格，做一个 fintech 落地页"，
> 希望 Agent 产出完整页面条目并自动登记，无需我做任何手工配置。

**流程（Agent 侧）**

1. 解析指令 → 确定创作模式、目标风格、页面主题。
2. 按学习协议读取 DESIGN.md（remix 模式读多份；original 模式跳过）。
3. 产出 `generated/pages/<page-id>/`：index.html + meta.json + notes.md。
4. 执行退出自检清单。
5. 向用户报告：产出路径 + 学了什么 + 邀请策展（"可在 Web 平台评分"）。

**流程（平台侧，生成后）**

6. 策展人运行 `npm run snapshot`（或 Web 平台一键按钮触发）：Playwright 对新页面截图写入 screenshot.png。
7. Web 平台扫描 `generated/pages/`，新目录自动出现在画廊（带"NEW"角标），无需重启。

**验收标准**

- [ ] 生成后 0 手工配置，画廊可见新条目（缺截图时显示占位样式）。
- [ ] meta.json 缺失或损坏的目录被降级显示（"元数据异常"徽章），不阻塞画廊。
- [ ] 相同指令重复执行不会覆盖旧页面（目录名冲突时自动加序号并说明）。

### 8.3 元数据与标签体系【P0】

**meta.json Schema（v1）**

```json
{
  "id": "20260818-stripe-fintech-landing",
  "title": "支付平台落地页",
  "created_at": "2026-08-18T10:30:00+08:00",
  "generator": { "agent": "zcode / GLM-5.3", "invoked_by": "curator" },
  "origin": "study",
  "lineage": ["stripe"],
  "page_type": "landing",
  "industry": ["fintech"],
  "mood": ["premium", "minimal"],
  "innovation": 1,
  "tags_ai": ["紫色渐变", "大字标题", "卡片式定价"],
  "tags_user": [],
  "rating": null,
  "status": "draft",
  "files": { "html": "index.html", "notes": "notes.md" }
}
```

**受控词表 v0.1（版本化管理，Web 端可扩展）**

| 字段 | 取值（初始集） | 打标者 |
|---|---|---|
| `page_type` 页面类型 | landing / dashboard / pricing / portfolio / blog / docs / login / e-commerce / settings / marketing | AI 预打，人工可改 |
| `industry` 行业 | fintech / dev-tool / ai / travel / health / education / social / media / enterprise / consumer | AI 预打，人工可改 |
| `mood` 情绪氛围 | minimal / dense / playful / premium / brutalist / soft / dark-first / editorial / retro / futuristic（多选） | AI 预打，人工可改 |
| `innovation` 创新度 | 0=纯复刻 / 1=微调 / 2=混血 / 3=原创 | AI 预打，人工可改 |
| `tags_ai` / `tags_user` 自由标签 | 任意短语（建议 ≤4 词） | AI 预打 / 人工添加 |
| `rating` 评分 | 1–5 星，0.5 步进 | 仅人工 |
| `status` 状态 | draft → published → promoted / archived | 系统流转 + 人工 |

**验收标准**

- [ ] Web 端标签编辑实时写回 meta.json（文件为唯一真源，无隐藏数据库）。
- [ ] 受控字段只能从词表选择（下拉/多选）；自由标签可任意输入。
- [ ] 所有写回经 schema 校验（zod），非法写入被拒绝并提示。

### 8.4 Web 平台：画廊与浏览【P0】

**用户故事**

> 作为策展人，我想在一屏内纵览所有生成页面，按风格来源、类型、评分筛选，
> 以便快速找到"上次那个做得好的页面"。

**功能点**

- **卡片网格**：缩略图（screenshot.png，懒加载）+ 标题 + lineage 徽章（如 `stripe` / `linear × vercel`）+ 创新模式图标 + 评分星 + NEW 角标。
- **筛选器组**：来源风格（种子 54 + 派生）/ 创作模式 / page_type / industry / mood / innovation / 评分下限 / 状态。
- **排序**：最新 / 评分最高 / 评分最低（找差评学习反面教材）。
- **搜索**：标题与标签的模糊匹配。
- **空态与异常态**：无结果提示、元数据异常徽章、截图缺失占位。

**验收标准**

- [ ] 首屏（100+ 页面条目）交互流畅，缩略图懒加载。
- [ ] 筛选组合（如 mood=premium AND rating≥4 AND industry=fintech）正确生效。
- [ ] 画廊同时只显示 status ∈ {draft, published} 的条目（archived 默认隐藏，可切换显示）。

### 8.5 Web 平台：详情与多设备预览【P0】

**用户故事**

> 作为策展人，我想在平台内直接预览页面并切换设备宽度，
> 同时看到它的元数据、谱系和设计笔记，以便一站式完成评价。

**功能点**

- **iframe 实时预览**：desktop(1280) / tablet(768) / mobile(375) 宽度切换 + "新标签页打开"。
- **信息面板**：元数据全量展示、lineage 徽章（可点击跳转风格详情）、notes.md 渲染（Markdown）、AI 标签 vs 人工标签分组展示。
- **策展区**：评分星、受控字段编辑、自由标签增删、状态流转按钮。
- **溯源对照（P1）**：并排打开所学风格的 `preview.html`，方便"像不像"对照。

**验收标准**

- [ ] 预览 iframe 与新标签页打开效果一致（相对路径资源正常）。
- [ ] 三档宽度切换即时生效，无需刷新。
- [ ] 所有策展操作即时持久化到 meta.json，刷新不丢失。

### 8.6 Web 平台：风格库浏览【P1】

**用户故事**

> 作为策展人，我想浏览全部可用风格（种子 + 派生）及其元信息，
> 以便决定下次召唤时让 Agent 学谁。

**功能点**

- **种子风格页签**：54 个风格的卡片（色板色块条 + 氛围关键词 + 分类），内嵌 iframe 或跳转打开其 `preview.html` / `preview-dark.html`；支持按 README 的六大分类（AI/开发工具/基础设施/设计生产力/金融/企业与消费）分组。
- **派生风格页签**：每个派生风格的 DESIGN.md 摘要、来源页面（评分）、子代页面列表、"再学习它"的建议提示词（一键复制，如 `学习 generated/styles/warm-brutalism-v1，remix 一点 notion 的暖色，做一个博客首页`）。
- **风格也可打标归类**（人工，P1）：给种子风格打 mood/industry 标签，方便筛选——但内容只读。

**验收标准**

- [ ] 种子风格页签完整展示 54 项，双主题预览可切换。
- [ ] 派生风格卡片能看到完整溯源：源自哪个页面 → 该页面 lineage 又指向哪些种子。
- [ ] "建议提示词"复制可用，且指向的路径真实存在。

### 8.7 进化闭环：评分 → 沉淀 → 再学习【P1，产品灵魂】

**用户故事**

> 作为策展人，我给一个混血页面打了 5 星后，想把它沉淀为派生风格，
> 让未来的 Agent 能站在这次成功之上创作，而不是每次从零开始。

**流程**

1. **触发**：详情页"沉淀为风格"按钮（仅 rating ≥ 4 时点亮；P2 支持强制越过）。
2. **提炼**：平台生成一段标准召唤指令（含页面路径、源风格 DESIGN.md 路径），策展人粘贴给 Agent 执行 AGENTS.md 的沉淀协议，产出 `generated/styles/<style-id>/`。
3. **登记**：源页面 status → `promoted`；派生风格 meta 记录 `source_page`、创建时间、初始评分（继承源页面评分）。
4. **再学习**：此后 Agent 学习白名单自动纳入该风格（见 8.1 学习协议）；画廊 lineage 出现新可选值。
5. **防退化（P2）**：派生风格也有评分，长期低分（<3）的风格移出默认推荐白名单（可手动启用）。

**验收标准**

- [ ] rating < 4 时按钮置灰并说明原因。
- [ ] 沉淀完成后：源页面出现"已沉淀 → warm-brutalism-v1"徽章；风格库出现新卡片；画廊 lineage 筛选器出现该风格。
- [ ] 全程无数据库：所有状态变更只体现为 meta.json 文件变更（git 可 diff）。

### 8.8 缩略图与截图自动化【P0】

**用户故事**

> 作为策展人，我希望每个页面有统一规格的封面截图，
> 画廊才有"设计作品集"的观感而非文件列表。

**功能点**

- `scripts/snapshot.mjs`：Playheadless 浏览器遍历无截图的页面目录，1280×800 截图，等待字体加载（networkidle + 500ms）。
- 触发方式：CLI（`npm run snapshot`）或 Web 平台"补截图"按钮（调用同一脚本）。
- 幂等：`--force` 才覆盖已有截图。

**验收标准**

- [ ] 新页面生成后一条命令补齐截图。
- [ ] 字体未加载完成不截图（避免系统字体假图）。

---

## 9. 数据模型与存储

**唯一真源 = 文件系统**，Web 平台无独立数据库：

- 读：启动时扫描 `generated/` 构建内存索引；文件 mtime 监听（或页面刷新时重扫）保持同步。
- 写：所有策展动作 = 编辑对应 meta.json（原子写入：临时文件 + rename）。
- 版本化：整个仓库 Git 管理，风格库的进化史天然可回溯。

派生风格 meta.json（v1）：

```json
{
  "id": "warm-brutalism-v1",
  "name": "暖色粗野主义",
  "created_at": "2026-09-01T09:00:00+08:00",
  "source_page": "20260828-notion-x-vercel-blog",
  "lineage": ["notion", "vercel"],
  "inherited_rating": 5,
  "rating": 5,
  "child_count": 0,
  "summary": "Notion 的暖色编辑感 × Vercel 的黑白精确度，粗野网格 + 衬线大标题"
}
```

---

## 10. 技术方案建议（实现细节由工程阶段定夺）

| 维度 | 建议 | 备选 |
|---|---|---|
| Web 框架 | **Next.js（App Router）+ TypeScript + Tailwind CSS**：SSR/文件路由/API Routes 一体，本地 `npm run dev` 即用 | Vite + React + 轻量 Node 服务；Astro |
| 存储 | 文件系统 + zod schema 校验 | SQLite 索引层（P2 若性能吃紧） |
| 截图 | Playwright（chromium） | Puppeteer |
| 源库隔离 | 契约（AGENTS.md）+ 校验脚本 | git submodule（P2 增强） |
| iframe 预览 | 静态 serve `generated/` 目录（Next.js public 或路由直读） | 独立静态服务器 |
| 运行环境 | Windows 本机（注意路径大小写与中文命名规避，已在 §7 命名规范约束） | — |

---

## 11. 成功指标（个人工具，轻量 HEART 变体）

| 维度 | 指标 | 初始目标（上线 1 个月） |
|---|---|---|
| 生成量（Engagement） | 累计生成页面数 / 活跃周数 | ≥ 20 页 |
| 质量（Happiness） | 平均评分；≥4 分页面占比 | 均分 ≥3.5；≥4 分占比 ≥25% |
| 策展参与（Adoption） | 有评分的页面占比；AI 标签人工修正率 | 评分覆盖 ≥80% |
| 进化活跃（North Star 候选） | **派生风格数 × 被再学习次数** | ≥ 2 个派生风格，各 ≥1 个子代 |
| 安全（基础保障） | 源目录违规写入次数 | 0 |

**North Star Metric 建议**：`被再学习的派生风格引用次数`——它同时驱动"生成质量高"（才会被沉淀）和"风格库在成长"（才会被再学习）。

---

## 12. 里程碑与范围

| 阶段 | 内容 | 退出标准 |
|---|---|---|
| **M0 规则与骨架**（第 1 周） | 目录结构落地、AGENTS.md 编写、meta schema 定稿、verify-readonly 脚本、手动召唤完成 3 个试点页面（三种 origin 各一） | 试点页面通过自检清单且源目录零变更 |
| **M1 Web MVP**（第 2–3 周） | 画廊、详情预览（三档宽度）、打标/评分/状态、snapshot 脚本 | §8.2/8.4/8.5 的 P0 验收全过 |
| **M2 闭环与风格库**（第 4 周起） | 风格库浏览（8.6）、沉淀流程（8.7）、lineage 徽章联动 | 完成第一次"高分页 → 派生风格 → 子代页面"全链路 |
| **M3 增强（二期）** | 定时自动生成（调度器随机选风格召唤 Agent API）、谱系可视化图、防退化推荐策略、统计看板、词表管理界面 | 另立 PRD |

---

## 13. 风险与对策

| # | 风险 | 概率/影响 | 对策 |
|---|---|---|---|
| R1 | Agent 违规写源目录，污染风格库 | 中 / 高 | AGENTS.md 红线 + verify 脚本 + 试点期人工抽查 git status；P2 submodule 物理隔离 |
| R2 | 品牌版权：生成页面与真实品牌过于相似 | 低 / 中 | 平台仅本地个人学习用途；页面 meta 与 notes 标注 inspired-by；Agent 规则禁止复用商标 Logo 与真实文案 |
| R3 | 页面质量参差，画廊劣化 | 中 / 中 | 评分 + archived 状态 + Do's & Don'ts 遵循；差评页保留作反面教材（排序功能支持） |
| R4 | 标签词表演化失控（同义标签泛滥） | 中 / 低 | 词表版本化；受控字段 + 自由标签分层；P2 词表管理 |
| R5 | 单 HTML 依赖字体 CDN，断网假图 | 中 / 低 | 允许 CDN 但截图脚本必须等待 networkidle；字体栈强制含系统回退 |
| R6 | iframe 数量多导致画廊卡顿 | 中 / 中 | 画廊默认用截图静态图，仅详情页加载 iframe |
| R7 | meta.json 手工/并发编辑损坏 | 低 / 中 | zod 校验 + 原子写入 + 损坏条目降级展示不阻塞 |
| R8 | Windows 路径/编码问题 | 中 / 低 | id 命名限定 `[a-z0-9-]`；展示文本走 UTF-8 meta 字段 |

---

## 14. 假设与依赖

1. 被召唤的 Agent 均会读取并遵守仓库根部 AGENTS.md（ZCode/Claude Code 类编码 Agent 的通行惯例）。
2. awesome-design-md 上游更新时，采用"拉取最新 + 只读"方式同步，不影响产出目录。
3. 本地环境可运行 Node.js 与 Playwright（Chromium）。
4. 个人使用规模（数百个页面条目内）下，文件系统扫描性能可接受。
5. 页面均为单页应用形态的静态展示页，无需后端逻辑与构建步骤。

---

## 15. 开放问题（待策展人决策）

| # | 问题 | 当前 PRD 默认值 |
|---|---|---|
| Q1 | Web 技术栈是否接受 Next.js？或偏好 Vue / 纯静态方案 | Next.js（§10） |
| Q2 | 种子风格（54 个原库）是否需要人工打标签归类 | 需要，P1（8.6） |
| Q3 | 沉淀派生风格的动作是否考虑未来自动化（评分达标自动触发） | 二期 M3 再评估 |
| Q4 | screenshot.png 是否需要双主题各截一张 | MVP 单张（浅色优先），P2 扩展 |
| Q5 | 是否将 awesome-design-md 转为 git submodule 以强化只读 | 暂不转，契约 + 脚本即可（R1） |

---

## 附录 A：一次典型使用剧本（Day in the Life）

```
19:00  策展人打开 ZCode：「学习 design-md/stripe 的 DESIGN.md，
       做一个 fintech SaaS 的落地页，origin=study」
19:01  Agent 读 AGENTS.md → 读 stripe/DESIGN.md → 生成
       generated/pages/20260818-stripe-fintech-landing/
       （index.html + meta.json + notes.md），跑自检清单，报告完成
19:05  策展人：npm run snapshot → 截图就位
19:06  打开 Web 平台，画廊顶部出现 NEW 卡片 → 进详情
19:08  1280/768/375 三档预览，对照 stripe/preview.html，打了 4.5 星，
       把 AI 的 mood=dark 修正为 light，加自由标签「斜排 CTA」
20:00  另一次召唤：「remix notion 的暖 + vercel 的准，做个博客首页」
       → lineage: ["notion", "vercel"]，innovation=2
三天后  博客首页被评 5 星 → 点击「沉淀为风格」→ 复制平台给的指令 →
       Agent 产出 generated/styles/warm-brutalism-v1/DESIGN.md
一周后  新召唤：「学习 warm-brutalism-v1，再混一点 spotify 的活力，
       做音乐产品官网」→ 风格谱系出现第三代页面
```

## 附录 B：AGENTS.md 章节大纲（实现时据此撰写）

见 §8.1 表格的 10 个章节；撰写时每个章节末尾附「自检提问」，供 Agent 逐项自问。

## 附录 C：变更记录

| 版本 | 日期 | 变更 |
|---|---|---|
| v0.1 | 2026-08-18 | 初稿：基于策展人 4 项关键决策（个人实验场 / 手动召唤 / 进化闭环 / AI 预打标）成文 |
