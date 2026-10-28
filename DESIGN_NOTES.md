# Design Notes — NPU Lab

## 2026 redesign (frontend-design skill)

**Direction:** silicon die floorplan + measurement instrument (not generic dark dashboard).

**Tokens**
- void `#0B0A12` · panel `#12111A` · line `#2C2839`
- ink `#EDE8F5` · muted `#918AA3`
- copper `#D4895A` (primary) · ok `#5BBF9A` · flux `#E85D7A`
- display: Bahnschrift (DIN) · body: Segoe UI / YaHei · data: Cascadia Code

**Signature:** home die-map SVG — curriculum as IP blocks on a wafer; copper traces; MAC core with subtle pulse.

**Avoid next time:** cyan-on-near-black tech dashboard, equal feature-card grids, large rounded bubbles.

**Keep:** all `app.js` DOM ids; content from repo lectures.

## Principle theater (刨根问底)

Added `view-principles` with canvas demos: P1 点积几何 · P2 线性塌缩/ReLU · P3 im2col · P4 Softmax+温度 · P5 INT8 格子/离群 · P6 运算强度 vs 带宽墙 · P7 BN 折叠。

Path cards show **前提** and **密度** per stage. Quiz/flashcards extended for these principles.

## 2026-10 UI pass（学习体验）

**Why:** 视觉方向保留（硅片 floorplan + 仪器），补的是"学习产品"缺的三件事：不迷路、能坚持、知道自己学会了什么。

**Changed**
- 路由：`location.hash` 深链 `#/view` 与 `#/lectures/<id>`；boot 时按 hash → lastView 恢复；`popstate/hashchange` 前后退可用；`applyRoute` 幂等（同视图同讲义不重渲染）。
- 进度：指标从"18 个视图是否打过勾"改为"已读讲义篇数"，自评降为副指标；`syncPathProgress()` 给阶段卡和讲义目录加局部计数。
- 首屏：`#resume-bar` 二态（CONTINUE / START HERE）。
- 排版：`.md-body` 15.5px / 1.82 / `#cfc9db` / `max-width:44em`；表格与引用同步提亮。
- 窄屏：`#nav-toggle` 抽屉（≤960px），替代 18 项折行。
- A11y：skip link、`aria-current="page"`、toast 变 `role=status`、焦点环、←/→ 翻讲义。
- 打印：`@media print` 只输出当前视图正文，转白底黑字。

**Keep:** 所有既有 DOM id 与 `data-*` 约定未变；token、字体栈、die-map 未动。

## 2026-09 双主题改造（护眼学习版）

- **默认 = 纸面学习主题**（暖米白 #f5f1e8 底 / 墨色 #3a352c 字 / 深铜 #a85f2e 强调），侧边栏 ☀/☾ 切换，localStorage `npu-theme` 持久化，无存储默认浅色。
- 结构：`:root` = 深色硅片（原版所有值原样保留）+ `html[data-theme="light"]` = 浅色覆盖。深色渲染路径与旧版逐值等价。
- canvas（原理剧场 P1-P7 等）颜色走 `applyCanvasPalette()` 从 CSS 变量实时取值，切换主题后重绘全部 canvas；讲义内嵌 SVG（lecture-viz.js）自带深色底，作为"书里的深色插图"无需适配；`.die-map` 用局部变量锁定深色（浅色页面上 = 桌上的一块开发板）。
- 新 token：`--ink-soft`（正文次级色）`--code-bg` `--bg-on-accent`（accent 按钮文字色）`--shadow` `--copper-rgb`（canvas rgba 拼接）。
- md-body 学习排版：16px / 1.9 行高 / 46em 列宽居中。
- **教训**：批量"硬编码→变量"替换会污染当时新插入的主题块，产生 `--x: var(--x)` 循环引用 → 大面积 invalid color → IAB 渲染垃圾（彩虹花屏）。以后主题块插入后不得再跑全局替换；改完必查 `--\w+:\s*var\(--\w+\)` 自引用。
- 切换判断与主题结构耦合：`data-theme="light"` 为浅色标记，toggle 条件是 `getAttribute("data-theme")==="light" ? dark : light`，别写反。
