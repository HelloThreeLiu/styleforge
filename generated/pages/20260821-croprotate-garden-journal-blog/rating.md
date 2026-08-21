# AI 评分：20260821-croprotate-garden-journal-blog — 茬口 CropRotate · 城市菜园种植日志博客

| 项 | 值 |
|---|---|
| 总分 | ★3.0 |
| 评分时间 | 2026-08-21T23:59:59+08:00 |
| 评分代理 | styleforge-rater（zcode / GLM-5.3） |
| 评分依据 | screenshot.png · index.html · DESIGN.md（lineage: cal） |

## 五维得分

| 维度 | 权重 | 得分 | 加权 | 关键证据（摘要） |
|---|---|---|---|---|
| 风格保真度 | 30% | 2.0 | 0.60 | 灰阶纪律/三层工作马阴影/深主按钮 0.7 hover/药丸几何等吸收点在页面中确实存在，但 notes 声称"零 `border:` 声明、全页分隔线均用 box-shadow ring 实现"，而 index.html L113 `footer { border-top: 1px solid var(--ring); }` 为明文 CSS border——notes 声明与实现不符，按规范门禁联动保真 ≤2 |
| 视觉工艺 | 25% | 4.5 | 1.125 | 截图确认灰阶排版干净、卡片三层阴影质感成立、日志卡 hover 阴影加深细节到位 |
| 完整性与内容 | 20% | 4.5 | 0.90 | 导航/hero/日志区/菜畦面板/订阅/页脚齐全，6 篇日志文案真实且有数据质感；375/768/1280 逐一处理 |
| 创意增值 | 15% | 4.0 | 0.60 | 自绘"菜畦面板"卡（mono 天数列 + 状态药丸）作为产品 UI 等价物是清晰亮点，节气筛选 tab 有真实交互含空态 |
| 工程合规 | 10% | 3.0 | 0.30 | 技术底线满足（单文件、回退栈、无外部图片），但 notes 第三方第 3 条绝对化声明被实现证伪，notes 质量打折 |
| **加权和** | | | **3.525** | |

最终分 **3.0**（向下取半 3.5 → 触发门禁"notes 声明与实现不符"封顶 3.0；min(3.5, 3.0) = 3.0）。

## 分维度评语

### 风格保真度
页面本身的 cal 基因传递度高：`:root` 灰阶（#242424/#111111/#898989/#f5f5f5）、--card-shadow 三层合成（接触 0 1px 5px -4px / ring 0 0 0 1px / 柔散 0 4px 8px）、--btn-inset 白 15% 高光、--well-inset 黑 16% 凹陷、#0099ff 唯一蓝仅正文链接下划线、深主按钮 hover opacity 0.7、药丸 9999px——均可溯源。但 DESIGN.md Don'ts 明文 "Use CSS borders when shadows can achieve the same containment — the ring-shadow technique is the system's approach"（禁止 CSS border），notes 亦声称全页零 border 声明，而 footer 顶线实为 `border-top: 1px solid`。该声明与实现不符触发门禁（封顶 3.0），并按联动将保真度压至 ≤2。Sora 替换 Cal Sans 已在 notes 声明且理由成立，不计违规。

### 视觉工艺
截图显示纯白画布 + 灰阶层级的 Cal.com 气质成立；日志卡 meta 行（节气标签 + mono 阅读时长）信息密度舒适；菜畦面板行分隔用 ring 阴影，视觉上与 border 无异且更柔和。无明显对齐/对比度瑕疵。

### 完整性与内容
结构齐全且内容质量高（芽眼朝上实验、堆肥 62℃ 温度线等细节可信）。810/768/640/375 断点逐一处理，640 收起 mono 天数列、375 卡题 20px。

### 创意增值
菜畦面板是对"产品 UI 截图"约束的聪明替代；节气 tab 筛选（含空态处理）是真实交互亮点。题材与灰阶工具气质适配良好。

### 工程合规
单文件、Google Fonts CDN + 系统回退栈、无外部图片均满足；扣分在 notes 与实现的一致性被 footer border 证伪。

## 门禁检查

- [x] 无外部图片
- [x] 三档断点齐全（375/768/1280 均有处理）
- [x] 字体系统回退
- [ ] **notes 与实现一致——违规**：notes 声称"零 border: 声明、全页分隔线均用 box-shadow ring"，index.html 第 113 行 footer 使用 `border-top: 1px solid var(--ring)`。触发封顶 3.0 + 保真度 ≤2 联动。

## 一句话结论

可惜的一页：视觉与工艺本身值 4.0+，但"ring 阴影替代 border"这一核心 cal 基因的绝对化声明被一处 footer CSS border 证伪，触发门禁封顶 3.0；修掉该 border（改为 box-shadow 0 1px 0 0 ring）即值得重评。

> 本评分为 AI 代评初稿，策展人可在 Web 平台随时改分；人类改分后以人类评分为准，本文件保留作审计记录。
