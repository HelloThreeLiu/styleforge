# AGENTS.md — StyleForge 平台 Agent 规则

> 本文件是本仓库所有被召唤 AI Agent 的**宪法**。任何 Agent 在执行任何创作任务前，必须先完整阅读本文件并遵守全部条款。违反任一红线条款的产出视为作废，必须重做。

---

## 1. 使命与角色

本仓库是 StyleForge——一个以 AI Agent 为生产力、以人类为策展人的 UI 设计实验平台。

你（Agent）在这里承担两种任务之一：

1. **生成任务**：学习一份或多份 DESIGN.md 风格文档，创作一个完整的 UI 页面。
2. **沉淀任务**：将某个高评分页面逆向提炼为一份新的 DESIGN.md（派生风格）。

人类（策展人）负责浏览、打标签、评分、决定哪些页面值得沉淀。你的产出一律进入画廊被人工评价，**不要试图代替人类做最终判断**。

---

## 2. 硬性红线（违反 = 产出作废）

| # | 红线 | 校验方式 |
|---|---|---|
| R1 | `awesome-design-md/` 目录下**任何文件**不得新增、修改、删除 | `npm run verify`（git status 检查） |
| R2 | 你只能写入 `generated/pages/` 与 `generated/styles/` 两个目录。`web/`、`docs/`、`scripts/`、`schema/`、根目录文件一律禁写 | 人工检查 + 自检 |
| R3 | 不得覆盖、修改、删除**已存在**的其他页面/风格目录。重做 = 新建新目录 | 自检 |
| R4 | 每个页面目录必须包含完整四件套（见 §5），缺一不可 | `npm run validate` |

**自检提问**：我刚才的每一次写文件操作，目标路径都在 `generated/` 之内吗？

---

## 3. 学习协议

你的学习来源有且只有两个白名单：

```
awesome-design-md/design-md/<style-name>/DESIGN.md   # 种子风格（54 个）
generated/styles/<style-id>/DESIGN.md                # 派生风格（仅评分 ≥ 4）
```

规则：

1. 生成前**必须通读**目标风格的 DESIGN.md 全文，重点吸收：色彩角色、字体层级、组件样式（按钮/卡片/输入框）、布局间距、阴影体系、Do's & Don'ts、响应式策略。
2. `preview.html` / `preview-dark.html` 为可选参考，用于校准整体氛围。
3. 派生风格若 `rating < 4`，不在默认学习白名单内（除非策展人明确点名要求）。
4. **禁止**凭记忆想象某个网站"大概长什么样"——一切以仓库内的 DESIGN.md 文档为准。

**自检提问**：我引用的每一个颜色值、字号、圆角，都能在 DESIGN.md 中找到依据吗？

---

## 4. 创作模式（origin）

| 模式 | 定义 | 自由度 | 约束 |
|---|---|---|---|
| `study` | 复刻单一风格 | 低：字体、色彩、圆角、阴影必须严格取自该 DESIGN.md；布局结构可自由发挥 | lineage 必须恰好 1 项 |
| `remix` | 多风格混血 | 中：每个父本风格必须贡献**可指出**的基因（如 A 的色彩 + B 的排版），笔记中说明谁贡献了什么 | lineage 必须 ≥ 2 项 |
| `original` | 原创风格 | 高：不依赖任何种子文档，自创设计语言 | lineage 必须为空数组；笔记中需完整声明自创的 tokens |

**自检提问**：如果策展人问"这个设计为什么长这样"，我能用 DESIGN.md 的条目或明确的原创理由回答吗？

---

## 5. 产出规范

### 5.1 目录与命名

```
generated/pages/<page-id>/
├── index.html      # 页面本体（你写）
├── meta.json       # 元数据（你写）
├── notes.md        # 设计笔记（你写）
└── screenshot.png  # 截图（平台脚本生成，你不要创建）
generated/styles/<style-id>/
├── DESIGN.md       # 派生风格文档（沉淀任务时你写）
└── meta.json       # 风格溯源（沉淀任务时你写）
```

- `<page-id>`：`YYYYMMDD-<主题关键词>-<页面类型>[-序号]`，仅允许 `[a-z0-9-]`，**禁止中文、空格、下划线、大写**。例：`20260818-stripe-fintech-landing`。
- `<style-id>`：`<风格英文名>-v<主版本>`，例：`warm-brutalism-v1`。
- 目录名冲突时追加 `-2`、`-3` 序号，绝不覆盖。

### 5.2 index.html 技术底线

1. **单文件自包含**：所有 CSS 写在 `<style>` 内、JS 写在 `<script>` 内；外部资源**仅允许** Google Fonts 等 CDN 字体。
2. **字体必须有系统回退栈**（截图脚本断网重试时不能白屏）。
3. **无外部图片**：装饰一律用 CSS 绘制（渐变、阴影、伪元素、border 图形）。
4. **响应式三档断点**：375px（mobile）/ 768px（tablet）/ 1280px（desktop），必须逐一处理，遵守源风格 Responsive Behavior 章节。
5. 页面必须是**完整可浏览**的作品：导航、英雄区、至少 3 个内容区、页脚，而非骨架占位。

### 5.3 meta.json 模板（字段缺失或非法 = 违反 R4）

```json
{
  "id": "20260818-stripe-fintech-landing",
  "title": "支付基础设施 SaaS 落地页",
  "created_at": "2026-08-18T10:30:00+08:00",
  "generator": { "agent": "zcode / GLM-5.3", "invoked_by": "curator" },
  "origin": "study",
  "lineage": ["stripe"],
  "page_type": "landing",
  "industry": ["fintech"],
  "mood": ["premium", "minimal"],
  "innovation": 1,
  "tags_ai": ["紫色渐变", "细字重大标题", "蓝调多层阴影"],
  "tags_user": [],
  "rating": null,
  "status": "draft",
  "files": { "html": "index.html", "notes": "notes.md" }
}
```

受控字段取值（词表 v0.2，见 `schema/meta.schema.json`）：

- `origin`：`study` | `remix` | `original`
- `page_type`：`landing` | `dashboard` | `pricing` | `portfolio` | `blog` | `docs` | `login` | `e-commerce` | `settings` | `marketing`
- `industry`（多选）：`fintech` | `dev-tool` | `ai` | `travel` | `health` | `education` | `social` | `media` | `enterprise` | `consumer` | `music` | `gaming` | `sports` | `food` | `fashion` | `real-estate` | `entertainment` | `science`
- `mood`（多选）：`minimal` | `dense` | `playful` | `premium` | `brutalist` | `soft` | `dark-first` | `editorial` | `retro` | `futuristic`
- `innovation`：`0` 纯复刻 | `1` 微调 | `2` 混血 | `3` 原创
- `status`：`draft` | `published` | `promoted` | `archived`
- `rating`：你**永远**写 `null`（评分属于人类）

`lineage` 取值：种子风格的目录名（如 `stripe`、`linear.app`）或派生风格 id（如 `warm-brutalism-v1`）。

---

## 6. 设计笔记要求（notes.md）

必含且仅含以下三节，标题固定：

```markdown
# 设计笔记：<页面标题>

## 一、从 DESIGN.md 学到的核心决策
（study/remix：列出吸收的具体 tokens——色值、字号字重、圆角、阴影配方及其角色含义）
（original：改为"自创设计语言声明"——完整列出你发明的 tokens）

## 二、本页面如何应用
（区域 × 决策的对应关系：英雄区用了什么、导航用了什么、为什么）

## 三、有意偏离点及理由
（任何偏离源风格的地方必须显式声明；没有偏离也要写"无"并说明遵守情况）
```

**自检提问**：策展人只读 notes.md 不看代码，能复述出这个页面的设计逻辑吗？

---

## 7. AI 预打标签

生成 meta.json 时：

- 受控字段（`page_type` / `industry` / `mood` / `innovation`）按词表选择；
- `tags_ai` 自由标签**至少 3 个**，每个 ≤ 4 词，描述页面最显著的视觉特征（如"斜切英雄区"、"衬线大标题"、"点阵背景"）；
- 这些是**初稿**，人类会在 Web 平台修正——打你真正观察到的，不要迎合。

---

## 8. 响应式底线

1. 三档断点（375 / 768 / 1280）全部显式处理，默认桌面优先编写、向下媒体查询收缩。
2. 触控目标 ≥ 44px（mobile）；文本禁止出现横向滚动。
3. 字体使用 `clamp()` 或显式断点缩放，display 字号在 375px 下不得小于 30px。

**自检提问**：我把窗口拉到 375px 宽，页面每个区域都仍然成立吗？

---

## 9. 退出自检清单（生成完成前逐项核对）

- [ ] `npm run verify` 通过（源目录零变更）
- [ ] `npm run validate` 通过（meta.json 合法）
- [ ] 目录名符合 `YYYYMMDD-...` 规范且未覆盖任何已有目录
- [ ] index.html 无外部依赖（字体 CDN 除外），字体含系统回退
- [ ] 三档断点已逐一处理
- [ ] notes.md 三节完整
- [ ] `rating` 为 `null`，`tags_ai` ≥ 3 个
- [ ] 已向策展人报告：产出路径 + 学了什么 + 提醒其评分

---

## 10. 沉淀协议（Promote）

当策展人说"把 `<page-id>` 沉淀为风格"时：

1. 读取该页面的 `index.html`、`notes.md`，以及其 lineage 指向的所有种子/派生 DESIGN.md。
2. **逆向提炼**一份新 DESIGN.md，结构遵循 Stitch 九章节：视觉主题与氛围 / 色彩与角色 / 字体规则 / 组件样式 / 布局原则 / 深度与阴影 / Do's & Don'ts / 响应式行为 / Agent 提示词指南。
3. 写入 `generated/styles/<style-id>/DESIGN.md`，并创建 `meta.json`：

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
  "summary": "一句话概括该风格的核心气质"
}
```

4. **不得**修改源页面的任何文件（状态流转通过 `npm run promote -- <page-id> <style-id>` 或 Web 平台完成）。
5. 提炼原则：只描述"值得传承的基因"，丢弃该页面的偶然选择；Do's & Don'ts 至少各 4 条。

**自检提问**：另一个 Agent 只读我提炼的 DESIGN.md，能做出神似但不相同的作品吗？

---

## 11. 一轮学习协议（单命令模式）

当策展人发出「学习」「执行一轮学习」这类**单条命令**时，按下述固定流程自主执行全程，**不得**反过来向策展人追问细节（计划中的随机结果即为最终决定）：

### 步骤

1. **取计划**：运行 `npm run round`，得到本轮计划（沉淀候选清单 + 随机抽取的 2 个风格 + 页面类型/行业建议）。
2. **沉淀阶段**：对计划中每个候选页面执行 §10 沉淀协议：
   - 逆向提炼 DESIGN.md，写入 `generated/styles/<style-id>/`（风格 id 由你命名，`<英文名>-v1`，不得与已有 id 冲突）；
   - 每完成一个，运行 `npm run promote -- <page-id> <style-id>` 完成状态流转（published → promoted）。
   - 候选为空时直接跳过本阶段。
3. **学习阶段**：按计划抽取的 2 个风格**各生成 1 个页面**（共 2 页）：
   - `origin=study`，`lineage` 指向所学风格；生成前必须通读该风格 DESIGN.md（§3）；
   - 页面类型与行业优先采纳计划建议（已自动避开最近 8 页使用过的类型/行业，并附非商品化主题方向建议 `suggest_theme`）；若结合内容自行改选，也必须满足：**两页的类型、行业、主题互不雷同，且 page_type / industry 不得与最近 8 页重复**。题材优先向工具、内容、社区、文化等非商品化方向发散，避免默认滑向"商品展示/定价"套路；
   - 产出规范、笔记、预打标签、响应式、自检全部照常执行（§5–§9）。
4. **补截图**：运行 `npm run snapshot`。
5. **全量校验**：`npm run verify && npm run validate`，任一失败必须修复后重跑。
6. **自动同步**：运行 `npm run sync`（脚本内部会重跑 verify/validate，并只提交已评分内容：本轮沉淀产物与状态流转照常推送，**未评分的新页面自动跳过**，待策展人评分后随下一轮 sync 推送）。提交信息由脚本按变更内容自动生成 conventional commits 格式（如 `content: 新增页面 X；沉淀派生风格 Y`），无需手动传入。
7. **汇报**：向策展人报告——沉淀了哪些风格（若有）、学了哪两个风格、两页产出路径、本轮 sync 推送/跳过了什么，并提醒其前往 Web 平台浏览评分。

### 边界提醒

- 全程仍然只写 `generated/` 两个子目录；`npm run round / snapshot / verify / validate / promote / sync` 是平台脚本的正常调用，不属于违规写入。
- 沉淀阶段顺延的候选（单轮超过 3 个时）在汇报中说明，下一轮自动处理。
- 若计划抽取的某个风格 DESIGN.md 内容过少无法支撑完整页面，可选择池中另一个风格并在汇报中说明原因。

**自检提问**：我这一轮是否做到了"零追问、零遗漏"——沉淀、两页生成、截图、校验、同步、汇报六件事全部完成？
