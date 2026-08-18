# 设计笔记：Signal 工程师博客首页

## 一、从 DESIGN.md 学到的核心决策

remix 双父本：`notion/DESIGN.md` + `vercel/DESIGN.md`。

**Notion 贡献（暖色编辑感）：**

| Token | 取值 | 用在哪 |
|---|---|---|
| 暖白 | `#f6f5f4`（黄底调暖灰） | 文章网格分区背景 |
| 暖字色 | `#615d59`（次级）`#a39e98`（占位/日期）`#31302e`（深） | 全部正文与元信息 |
| 近黑墨 | `rgba(0,0,0,0.95)` | 标题 |
| 耳语边框 | `1px solid rgba(0,0,0,0.1)` | 卡片分隔线、卡片底部 |
| Notion Blue | `#0075de` CTA / hover `#005bab` | 订阅按钮、链接悬停、英雄区强调词 |
| 药丸徽章 | `#f2f9ff` 底 / `#097fe8` 字 / 9999px | 选题标签 |
| 卡片圆角 | 12px（标准）/ 16px（featured） | 文章卡与精选卡 |
| 柔影 | 四层累计透明度 ≤0.04 | 卡片 hover |
| 压缩排版 | 64px/700/-2.125px，`"lnum","locl"` | 英雄区大标题 |

**Vercel 贡献（黑白精确度）：**

| Token | 取值 | 用在哪 |
|---|---|---|
| Geist Mono 大写标签 | 12px/500/uppercase/字距 .08em | 眉题、期号、阅读时长、页脚栏目标题 |
| 阴影即边框 | `rgba(0,0,0,0.08) 0 0 0 1px` | 精选卡、订阅卡、头像的外框 |
| Vercel 黑 | `#171717` | 页脚整块深色 |
| 工作流三色 | Develop `#0a72ef` / Preview `#de1d8d` / Ship `#ff5b4f` | 选题圆点与文章分类点 |
| 聚焦环 | 输入框 focus 2px 蓝环 | 订阅表单 |

## 二、本页面如何应用

混血策略是**分区继承 + 叠加合成**，让两个父本各说各的长处而非糅成一团灰：

- **英雄区 = Notion 的脸**：64px/700/-2.125px 的 Notion 式压缩大标题 + 暖灰次级文本 + Notion Blue 的"值得收藏"强调词。
- **眉题 = Vercel 的声音**：Geist Mono 大写标签 `ISSUE 042 · WEEKLY DISPATCH`，与 Notion 的暖标题形成"终端 × 纸面"的质感对撞。
- **精选卡 = 叠加合成**：同时挂 Vercel 的影线边框（`0 0 0 1px`）与 Notion 的四层柔影——精确的轮廓 + 温柔的悬浮。
- **文章网格 = Notion 的纸**：暖白分区里排白卡片，耳语边框 + hover 柔影；卡内左上用 Vercel 三色圆点做分类语义（蓝=架构、粉=前端、红=发布运维）。
- **订阅卡 = Vercel 的形 + Notion 的暖**：影线边框白卡，输入框 focus 用 Notion 蓝环。
- **页脚 = Vercel 的黑**：`#171717` 深黑页脚，栏目标题全部 Geist Mono 大写，收束整页的"精确感"。

## 三、有意偏离点及理由

1. **字体**：NotionInter 与 Geist 均为私有钱夹字体，按底线规则以 Google Fonts 的 Inter（四字重 400/500/600/700 对齐 Notion 权重体系）+ Geist Mono（Google Fonts 已收录，可正宗使用）替代；字体栈首位保留 `NotionInter` 声明。
2. **Vercel 三色的语义重用**：DESIGN.md 中三色是 Develop→Preview→Ship 工作流步骤色，本页将其重映射为博客的三个内容分类——保留"色彩即流程语义"的精神，但语义本体改为内容分类，属 remix 模式允许的基因转译，已在此声明。
3. 无其他偏离。
