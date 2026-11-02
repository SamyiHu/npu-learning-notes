/* 从仓库 md 重新生成 lectures.js：node _build_lectures.cjs */
const fs = require("fs");
const path = require("path");
const root = __dirname;

const LECTURES = [
  { id: "l00start", stage: "00-零基础", title: "开始这里 · 学习入口", file: "00-开始这里.md", demos: ["path"] },
  { id: "l00base", stage: "00-零基础", title: "小白基础补课", file: "00-小白基础补课.md", demos: ["bitflow", "demo-quant"] },
  { id: "l00gloss", stage: "00-零基础", title: "术语表", file: "00-术语表.md", demos: [] },
  { id: "l01a", stage: "01-神经网络基础", title: "第1~2课 · 神经元、矩阵乘、卷积", file: "01-神经网络基础/第1~2课笔记.md", demos: ["demo-conv", "principles"] },
  { id: "l01b", stage: "01-神经网络基础", title: "第1.5课 · 线性代数详解", file: "01-神经网络基础/第1.5课-线性代数详解.md", demos: ["principles"] },
  { id: "l01c", stage: "01-神经网络基础", title: "第3课 · 池化与归一化", file: "01-神经网络基础/第3课-池化与归一化.md", demos: ["demo-pool"] },
  { id: "l01d", stage: "01-神经网络基础", title: "第4课 · 模型全貌", file: "01-神经网络基础/第4课-模型全貌.md", demos: ["demo-conv"] },
  { id: "l02a", stage: "02-为何需要NPU", title: "第1课 · 精度与量化", file: "02-为何需要NPU/第1课-精度与量化.md", demos: ["demo-quant", "principles", "bitflow"] },
  { id: "l02b", stage: "02-为何需要NPU", title: "第2课 · CPU/GPU/NPU", file: "02-为何需要NPU/第2课-CPU-GPU-NPU.md", demos: ["demo-mac", "bitflow"] },
  { id: "l03a", stage: "03-NPU硬件架构", title: "第1课 · MAC阵列与数据流", file: "03-NPU硬件架构/第1课-MAC阵列与数据流.md", demos: ["demo-npu", "principles", "bitflow"] },
  { id: "l03b", stage: "03-NPU硬件架构", title: "第2课 · 存储层次与数据搬运", file: "03-NPU硬件架构/第2课-存储层次与数据搬运.md", demos: ["principles", "bitflow"] },
  { id: "l03c", stage: "03-NPU硬件架构", title: "第3课 · RKNPU架构实例", file: "03-NPU硬件架构/第3课-RKNPU架构实例.md", demos: ["demo-npu", "model"] },
  { id: "l04a", stage: "04-软件工具链", title: "第1课 · 部署链路全景", file: "04-软件工具链/第1课-部署链路全景.md", demos: ["demo-pipe", "model"] },
  { id: "l04b", stage: "04-软件工具链", title: "第2课 · 板端运行时与驱动", file: "04-软件工具链/第2课-板端运行时与驱动.md", demos: ["model", "demo-pipe"] },
  { id: "l05a", stage: "05-实践", title: "RK3576 上手指引", file: "05-实践/RK3576上手指引.md", demos: ["model"] },
  { id: "l05b", stage: "05-实践", title: "RK 芯片选型指南", file: "05-实践/RK芯片选型指南.md", demos: ["demo-mac"] },
  { id: "l05c", stage: "05-实践", title: "韦东山教程评估与使用指南", file: "05-实践/韦东山教程评估与使用指南.md", demos: [] },
  { id: "l05d", stage: "05-实践", title: "第3课 · 模型实战全链路", file: "05-实践/第3课-模型实战全链路.md", demos: ["demo-pipe", "demo-quant", "model"] },
  { id: "l06a", stage: "06-大模型与Transformer", title: "第1课 · 大模型全景", file: "06-大模型与Transformer/第1课-大模型全景.md", demos: ["demo-attn"] },
  { id: "l06b", stage: "06-大模型与Transformer", title: "第2课 · 注意力机制", file: "06-大模型与Transformer/第2课-注意力机制.md", demos: ["demo-attn", "principles"] },
  { id: "l06c", stage: "06-大模型与Transformer", title: "第3课 · 位置编码与Transformer块", file: "06-大模型与Transformer/第3课-位置编码与Transformer块.md", demos: ["demo-attn"] },
  { id: "l07a", stage: "07-Linux与SoC补课", title: "第1课 · Linux生存包", file: "07-Linux与SoC补课/第1课-Linux生存包-面向NPU部署.md", demos: [] },
  { id: "l07b", stage: "07-Linux与SoC补课", title: "第2课 · SoC内部地图", file: "07-Linux与SoC补课/第2课-SoC内部地图.md", demos: ["demo-npu"] },
  { id: "l07c", stage: "07-Linux与SoC补课", title: "第3课 · 驱动与设备树入门", file: "07-Linux与SoC补课/第3课-驱动与设备树入门.md", demos: ["demo-pipe", "model"] },
  { id: "l08a", stage: "08-数电补课", title: "第1课 · MAC乘法器与加法树", file: "08-数电补课/第1课-MAC乘法器与加法树.md", demos: ["bitflow", "demo-mac"] },
  { id: "l08b", stage: "08-数电补课", title: "第2课 · 存储流水线与任务控制", file: "08-数电补课/第2课-存储流水线与任务控制.md", demos: ["demo-npu", "bitflow", "principles"] },
  { id: "l09a", stage: "09-数学补课", title: "第1课 · 指数对数与Softmax", file: "09-数学补课/第1课-指数对数与Softmax.md", demos: ["principles", "demo-attn"] },
  { id: "l09b", stage: "09-数学补课", title: "第2课 · 梯度直觉", file: "09-数学补课/第2课-梯度直觉.md", demos: ["principles"] },
  { id: "l00a", stage: "总览", title: "学习路线", file: "学习路线.md", demos: ["path"] },
  { id: "l00b", stage: "总览", title: "问答收录", file: "问答收录.md", demos: ["quiz", "cards"] },
  { id: "l00c", stage: "总览", title: "资料索引", file: "资料索引.md", demos: [] },
];

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ── 把 md 里的矩阵/向量/卷积 ASCII 例子渲染成网页组件 ── */
function parseNumRow(line) {
  const t = line.replace(/[│┌┐└┘├┤┬┴┼|]/g, " ").replace(/[×·]/g, " ");
  const parts = t.trim().split(/\s+/).filter(Boolean);
  const nums = [];
  for (const p of parts) {
    const c = p.replace(/[,;[\]]/g, "");
    if (c === "") continue;
    if (/^-?\d+(\.\d+)?$/.test(c)) nums.push(c);
    else if (/^-?\d+(\.\d+)?×-?\d+(\.\d+)?$/.test(c)) nums.push(c); // 1×5
    else return null;
  }
  return nums.length >= 2 ? nums : null;
}

function matrixHtml(rows, opts = {}) {
  const cols = Math.max(...rows.map((r) => r.length));
  const cells = rows
    .map(
      (r) =>
        `<tr>${Array.from({ length: cols }, (_, j) => {
          const v = r[j] == null ? "" : r[j];
          const hi = opts.highlight && opts.highlight.has(`${rows.indexOf(r)},${j}`);
          return `<td class="${hi ? "hi" : ""}">${escapeHtml(v)}</td>`;
        }).join("")}</tr>`
    )
    .join("");
  const lab = opts.label ? `<div class="md-mat-label">${escapeHtml(opts.label)}</div>` : "";
  return `<div class="md-mat">${lab}<table class="md-mat-table"><tbody>${cells}</tbody></table></div>`;
}

function renderCodeBlock(raw) {
  const text = raw.replace(/\t/g, "  ");
  const lines = text.split("\n");

  /* 二进制乘法竖式 */
  if (/^\s*[01]{2,}\s*(\(\d+\))?/m.test(text) && /×/.test(text) && /[01]{4,}/.test(text)) {
    const binLines = lines.filter((l) => /[01]{3,}/.test(l));
    if (binLines.length >= 3) {
      const bits = binLines.map((l) => l.replace(/[^\d]/g, "")).filter((b) => /^[01]+$/.test(b) && b.length >= 3);
      if (bits.length >= 3) {
        return `<div class="md-math-block">
          <div class="micro" style="margin-bottom:8px;color:var(--copper)">二进制乘法 · 部分积</div>
          <div class="md-binmul">
            ${bits.map((b, i) => `<div class="md-binrow${i === bits.length - 1 ? " res" : ""}">${escapeHtml(b)}</div>`).join("")}
          </div>
          <p class="md-math-note">每行 = 与门+移位的「部分积」，再竖着加。位宽↑ → 树更深 → 面积/功耗↑。</p>
        </div>`;
      }
    }
  }

  /* 双缓冲时间轴 */
  if (/搬\s*tile/i.test(text) && /算\s*tile/i.test(text)) {
    return `<div class="md-math-block">
      <div class="micro" style="margin-bottom:8px;color:var(--copper)">双缓冲时序</div>
      <div class="md-timeline">
        <div class="md-tl-row"><span class="md-tl-lab">DMA</span>
          <span class="md-tl-bar copper">搬 tile0</span>
          <span class="md-tl-bar copper">搬 tile1</span>
          <span class="md-tl-bar copper">搬 tile2</span>
        </div>
        <div class="md-tl-row"><span class="md-tl-lab">MAC</span>
          <span class="md-tl-bar ok">算 tile0</span>
          <span class="md-tl-bar ok">算 tile1</span>
        </div>
      </div>
      <p class="md-math-note">错开半拍 = 把访存藏进计算。串行「搬完再算」利用率大约减半。</p>
    </div>`;
  }

  /* 串行加法 vs 树 */
  if (/串行/.test(text) && /树/.test(text) && /p0|p1|\+/.test(text)) {
    return `<div class="md-math-block">
      <div class="md-views">
        <div class="md-view-card">
          <div class="micro">串行累加</div>
          <div class="md-yrow">((p0+p1)+p2)+…</div>
          <p>省面积，延迟长</p>
        </div>
        <div class="md-view-card">
          <div class="micro">加法树</div>
          <div class="md-yrow">(p0+p1)∥(p2+p3) → Σ</div>
          <p>延迟 ~log₂N，面积大</p>
        </div>
      </div>
    </div>`;
  }

  /* 卷积例子：核 + 图 + 窗口计算 */
  if (/核\s*\[/.test(text) && /图\s*[:：]/.test(text)) {
    const kerLine = lines.find((l) => /核\s*\[/.test(l)) || "";
    const kerM = kerLine.match(/\[([^\]]+)\]/);
    const ker = kerM ? kerM[1].split(/[;\s]+/).filter(Boolean) : ["1", "2", "3", "4"];
    const kerRows = [ker.slice(0, 2), ker.slice(2, 4)];
    const imgStart = lines.findIndex((l) => /图\s*[:：]/.test(l));
    const imgRows = [];
    for (let k = imgStart + 1; k < lines.length; k++) {
      const r = parseNumRow(lines[k]);
      if (r && r.length === 3) imgRows.push(r);
      else if (imgRows.length && !r) break;
    }
    const winLines = lines.filter((l) => /窗口/.test(l));
    const outLine = lines.find((l) => /输出特征图/.test(l));
    const outNums = [];
    lines.forEach((l, idx) => {
      if (/输出特征图/.test(l)) {
        const rest = l.split(/输出特征图\s*[:：]?\s*/)[1] || "";
        rest.split(/\s+/).forEach((x) => { if (/^\d+$/.test(x)) outNums.push(x); });
        if (lines[idx + 1]) {
          lines[idx + 1].trim().split(/\s+/).forEach((x) => { if (/^\d+$/.test(x)) outNums.push(x); });
        }
      }
    });
    const winsHtml = winLines
      .map((l) => {
        const m = l.match(/窗口\s*(\d+)\s*→\s*(.+?)\s*=\s*(\d+)/);
        if (!m) return `<li>${escapeHtml(l.trim())}</li>`;
        return `<li><b>窗口${m[1]}</b> <span class="md-eq">${escapeHtml(m[2].trim())}</span> <span class="md-eq-res">= ${m[3]}</span></li>`;
      })
      .join("");
    return `<div class="md-math-block">
      <div class="md-math-row">
        ${matrixHtml(kerRows, { label: "核 2×2" })}
        <span class="md-op">×</span>
        ${matrixHtml(imgRows.length ? imgRows : [["1","2","3"],["4","5","6"],["7","8","9"]], { label: "输入 3×3" })}
        <span class="md-op">→</span>
        ${matrixHtml([outNums.slice(0, 2), outNums.slice(2, 4)], { label: "输出 2×2" })}
      </div>
      <ul class="md-win-list">${winsHtml}</ul>
    </div>`;
  }

  /* 矩阵乘法链：A × B = C */
  if (text.includes("×") && /[［[]|┌/.test(text) && text.includes("=")) {
    const cleanLines = lines.map((l) => l.trim()).filter(Boolean);
    // try split by = into groups of number rows
    const all = [];
    cleanLines.forEach((l) => {
      const parts = l.split(/\s*=\s*/);
      parts.forEach((seg, gi) => {
        const nums = [];
        // extract bracket groups or loose numbers
        const bracket = seg.match(/\[[^\]]+\]/g);
        if (bracket && bracket.length >= 1) {
          bracket.forEach((b) => {
            const inner = b.slice(1, -1).replace(/[,;]/g, " ").trim().split(/\s+/).filter(Boolean);
            if (inner.length) nums.push(inner);
          });
        } else {
          const r = parseNumRow(seg.replace(/×/g, " "));
          if (r) nums.push(r);
        }
        if (!all[gi]) all[gi] = [];
        nums.forEach((row, ri) => {
          if (!all[gi][ri]) all[gi][ri] = [];
          // flatten single-row brackets into one matrix row set
          all[gi][ri] = all[gi][ri].concat(row);
        });
      });
    });
    // Better dedicated parse for classic 2x2 example
    const flat = text.replace(/\s+/g, " ");
    const m2 = flat.match(
      /\[(\d+)\s+(\d+)\]\s*\[(\d+)\s+(\d+)\].*?\[(\d+)\s+(\d+)\]\s*\[(\d+)\s+(\d+)\].*?\[(\d+)\s+(\d+)\].*?\[(\d+)\s+(\d+)\]/
    );
    if (m2) {
      const A = [[m2[1], m2[2]], [m2[3], m2[4]]];
      const B = [[m2[5], m2[6]], [m2[7], m2[8]]];
      const C = [[m2[9], m2[10]], [m2[11], m2[12]]];
      return `<div class="md-math-block">
        <div class="md-math-row">
          ${matrixHtml(A, { label: "A" })}
          <span class="md-op">×</span>
          ${matrixHtml(B, { label: "B" })}
          <span class="md-op">=</span>
          ${matrixHtml(C, { label: "C" })}
        </div>
        <p class="md-math-note">规则：左行 × 右列，对应相乘再相加。结果形状 =（左行数, 右列数）。</p>
      </div>`;
    }
  }

  /* 权重 × 输入 = 输出（神经网络写法） */
  if (/权重/.test(text) && /输入/.test(text)) {
    const rowsW = [];
    const rowsY = [];
    lines.forEach((l) => {
      const nums = [];
      l.replace(/[│┌┐└┘├┤|×]/g, " ").replace(/\[[\s]*\]/g, " ").split(/\s+/).forEach((p) => {
        const c = p.replace(/^\[|\]$/g, "").replace(/,/g, "");
        if (/^-?\d+(\.\d+)?$/.test(c)) nums.push(c);
      });
      if (nums.length >= 3) rowsW.push(nums.slice(0, 3));
      if (nums.length === 1 && /^\d+$/.test(nums[0])) {
        /* skip col vector alone */
      }
      const ym = l.match(/([\d.]+)×([\d.]+)\+([\d.]+)×([\d.]+)\+([\d.]+)×([\d.]+)/);
      if (ym) rowsY.push([`${ym[0]}`]);
    });
    const xCol = [];
    lines.forEach((l) => {
      const m = l.match(/^\s*[\[│]?\s*(\d+)\s*[\]│]?/);
      if (m && /9|6|3/.test(m[1]) && l.includes("9") === false) {
        /* fragile */
      }
    });
    // extract x = [9,6,3]
    const xm = text.match(/\[\s*9\s*[\]│\n].*?6.*?3/s) || text.match(/9[\s\S]{0,20}6[\s\S]{0,20}3/);
    const xVec = ["9", "6", "3"];
    if (rowsW.length >= 3) {
      return `<div class="md-math-block">
        <div class="md-math-row">
          ${matrixHtml(rowsW.slice(0, 4), { label: "权重 W" })}
          <span class="md-op">×</span>
          ${matrixHtml([[xVec[0]], [xVec[1]], [xVec[2]]], { label: "输入 x" })}
          <span class="md-op">=</span>
          <div class="md-mat">
            <div class="md-mat-label">输出 y</div>
            <div class="md-ylist">
              ${rowsW
                .slice(0, 4)
                .map(
                  (r, i) =>
                    `<div class="md-yrow"><span class="md-yi">y${i}</span> = ${r[0]}×9 + ${r[1]}×6 + ${r[2]}×3</div>`
                )
                .join("")}
            </div>
          </div>
        </div>
        <p class="md-math-note">每个输出 = 取 W 的一行（一个神经元）与 x 做点积。</p>
      </div>`;
    }
  }

  /* 行向量 / 列向量 */
  if (/行向量/.test(text) && /列向量/.test(text)) {
    return `<div class="md-math-block">
      <div class="md-vec-row">
        <div class="md-vec-card">
          <div class="micro">行向量</div>
          <div class="md-rowvec">[9, 6, 3]</div>
          <div class="md-vec-cap">横着写</div>
        </div>
        <div class="md-vec-card">
          <div class="micro">列向量</div>
          <div class="md-colvec"><span>9</span><span>6</span><span>3</span></div>
          <div class="md-vec-cap">竖着写 · 网络默认</div>
        </div>
      </div>
      <p class="md-math-note">向量 = 一串有顺序的数。点积 = 对应相乘再相加，结果是一个数。</p>
    </div>`;
  }

  /* 通用数字网格（池化输入等）：多行等宽数字 */
  const gridRows = [];
  lines.forEach((l) => {
    if (/for |def |import |#include|printf|malloc/.test(l)) return;
    const r = parseNumRow(l);
    if (r && r.length >= 2 && r.length <= 16) gridRows.push(r);
  });
  if (gridRows.length >= 2 && gridRows.every((r) => r.length === gridRows[0].length) && gridRows.length <= 16) {
    return `<div class="md-math-block">
      <div class="md-math-row">${matrixHtml(gridRows)}</div>
    </div>`;
  }

  /* 点积手算： [2, 3, 1] · [4, 0, 5] = 2×4 + ... = 13 */
  /* 三条方向对照：必须先于通用点积，否则会被吃掉 */
  if (text.includes("方向一致") && /[·•]/.test(text)) {
    const rows = lines
      .map((l) => {
        const m = l.match(
          /\[\s*([-\d.,\s]+)\s*\]\s*[·•]\s*\[\s*([-\d.,\s]+)\s*\]\s*=\s*([-\d.]+)\s*(?:←\s*(.+))?/
        );
        if (!m) return null;
        return { a: m[1].trim(), b: m[2].trim(), r: m[3], note: (m[4] || "").trim() };
      })
      .filter(Boolean);
    if (rows.length >= 2) {
      return `<div class="md-math-block">
        <div class="md-dirgrid">
          ${rows
            .map(
              (r) => `<div class="md-dircell${r.r === "0" ? " zero" : +r.r < 0 ? " neg" : " pos"}">
              <div class="md-dir-eq">[${r.a}] · [${r.b}]</div>
              <div class="md-dir-val">${r.r}</div>
              <div class="md-dir-note">${escapeHtml(r.note)}</div>
            </div>`
            )
            .join("")}
        </div>
        <p class="md-math-note">点积 = |a||b|cosθ。方向一致最大，垂直为 0，反向为负。MAC 就是在算点积。</p>
      </div>`;
    }
  }

  const dot = text.match(
    /\[\s*([-\d.,\s]+)\s*\]\s*[·•]\s*\[\s*([-\d.,\s]+)\s*\]\s*=\s*(.+?)(?:\n|$)/
  );
  if (dot) {
    const a = dot[1].split(/[,\s]+/).filter(Boolean);
    const b = dot[2].split(/[,\s]+/).filter(Boolean);
    const expr = (dot[3] || "").trim();
    const resM = expr.match(/=\s*(-?\d+(?:\.\d+)?)\s*$/);
    const res = resM ? resM[1] : expr.split("=").pop().trim().split(/\s+/)[0];
    return `<div class="md-math-block md-dotcard">
      <div class="md-dotvecs">
        <div class="md-vecchip">a = [${a.join(", ")}]</div>
        <span class="md-op">·</span>
        <div class="md-vecchip">b = [${b.join(", ")}]</div>
      </div>
      <div class="md-dotpairs">
        ${a.map((x, i) => `<span class="md-pair"><b>${x}</b>×<b>${b[i]}</b>=${(parseFloat(x)*parseFloat(b[i]))}</span>`).join('<span class="md-plus">+</span>')}
      </div>
      <div class="md-dotres">= <strong>${res}</strong></div>
    </div>`;
  }

  /* 成绩 × 学分：80×3 + 90×4 + 70×2 = 740 */
  /* 只认「单行」的连乘求和式；多行块（如 LoRA 参数拆解）留给公式框 */
  const score = text.trim().split("\n").filter((l) => l.trim()).length === 1 ? text.match(
    /((?:\d+\s*×\s*\d+\s*\+\s*)+\d+\s*×\s*\d+)\s*=\s*(.+?)(?:\n|$)/
  ) : null;
  if (score && /[+]/.test(score[1]) && /×/.test(score[1])) {
    const terms = score[1].split("+").map((s) => s.trim());
    const nums = terms.map((t) => {
      const m = t.match(/(\d+)\s*×\s*(\d+)/);
      return m ? { x: m[1], y: m[2], p: +m[1] * +m[2] } : null;
    }).filter(Boolean);
    const sum = nums.reduce((s, n) => s + n.p, 0);
    const tail = (score[2] || "").trim();
    const finalM = tail.match(/(\d+(?:\.\d+)?)\s*$/);
    return `<div class="md-math-block">
      <div class="md-score">
        ${nums.map((n) => `<div class="md-score-cell"><span class="sc-a">${n.x}</span><span class="sc-x">×</span><span class="sc-b">${n.y}</span><span class="sc-eq">=</span><span class="sc-p">${n.p}</span></div>`).join("")}
      </div>
      <div class="md-dotres">Σ = <strong>${finalM ? finalM[1] : sum}</strong></div>
      <p class="md-math-note">对应位置相乘再相加 — 这就是点积 / 加权总分。</p>
    </div>`;
  }

  /* 公式定义行：a · b = a₁×b₁ + ... */
  if (/a\s*[·•]\s*b\s*=/.test(text) && text.length < 120) {
    return `<div class="md-math-block md-formula">
      <div class="md-formula-line">${escapeHtml(text.trim()).replace(/·/g, '<span class="md-fop">·</span>').replace(/\+/g, ' <span class="md-fop">+</span> ')}</div>
      <p class="md-math-note">要求：两个向量长度相同。结果：一个数（标量）。</p>
    </div>`;
  }

  /* 权重表：神经元1 [ 0.5 0.2 0.8 ] */
  if (/神经元\s*\d/.test(text) && /\[/.test(text)) {
    const rows = [];
    const labels = [];
    lines.forEach((l) => {
      const m = l.match(/神经元\s*(\d+)\s*\[\s*([-\d.\s]+?)\s*\]/);
      if (m) {
        const nums = m[2].trim().split(/\s+/).filter((x) => /^-?\d/.test(x));
        if (nums.length >= 2) {
          labels.push("神经元" + m[1]);
          rows.push(nums);
        }
      }
    });
    if (rows.length >= 2) {
      const nCols = rows[0].length;
      const colHeads = Array.from({ length: nCols }, (_, j) => `输入${j + 1}`);
      return `<div class="md-math-block">
        <div class="md-labeled-mat">
          <div class="md-lm-cols micro">${colHeads.join(" · ")}</div>
          <table class="md-lm-table">
            <tbody>
              ${rows
                .map(
                  (r, i) =>
                    `<tr><th>${labels[i] || "N" + i}</th>${r.map((v) => `<td>${escapeHtml(v)}</td>`).join("")}</tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
        <p class="md-math-note">记作 ${rows.length}×${nCols}（行×列）矩阵。每行 = 一个神经元的全部权重。</p>
      </div>`;
    }
  }

  /* 视角 A/B：row / col 堆叠 */
  if (/视角\s*A/.test(text) || /row₀|row0/.test(text) || /一堆行向量/.test(text)) {
    return `<div class="md-math-block">
      <div class="md-views">
        <div class="md-view-card">
          <div class="micro">视角 A · 行向量摞叠</div>
          <div class="md-stack-rows">
            <span>row₀</span><span>row₁</span><span>row₂</span><span>row₃</span>
          </div>
          <p>每行 = 一个神经元的权重，和输入做点积 → 一个输出</p>
        </div>
        <div class="md-view-card">
          <div class="micro">视角 B · 列向量横排</div>
          <div class="md-stack-cols">
            <span>col₀</span><span>col₁</span><span>col₂</span>
          </div>
          <p>每列 = 一个输入在所有神经元上的权重</p>
        </div>
      </div>
      <p class="md-math-note">做矩阵乘法时默认用视角 A：<b>一行一行取</b>。</p>
    </div>`;
  }

  /* W × x = y 全连接展开（已有）之后的通用公式行 */
  const formulaLines = lines.filter((l) => /[=×·]/.test(l) && l.trim().length > 3 && l.trim().length < 100);
  const nonEmpty = lines.filter((l) => l.trim()).length;
  const codeLike = /for |while |def |class |#include|printf|malloc|import |=>|->/.test(text);
  // 只有当「几乎所有非空行都是公式行」时才转公式框：
  // 否则像矩阵/框图那样带边框字符的 ASCII 图会被砍成只剩含 = 的几行
  if (!codeLike && formulaLines.length >= 1 && formulaLines.length <= 8 && /[=×·+]/.test(text)
      && formulaLines.length >= nonEmpty - 1) {
    // if almost every line is a math expression, render as equation list
    const bad = formulaLines.filter((l) => !/[=\d×·+·Σμσγα]/.test(l) && !/←/.test(l));
    if (bad.length === 0) {
      return `<div class="md-math-block md-eqbox">
        ${formulaLines
          .map((l) => {
            const t = escapeHtml(l.trim());
            const hasNote = t.includes("←");
            if (hasNote) {
              const [eq, note] = t.split("←");
              return `<div class="md-eqline"><span class="md-eqmain">${eq.trim()}</span><span class="md-eqarrow">←</span><span class="md-eqnote">${note.trim()}</span></div>`;
            }
            return `<div class="md-eqline"><span class="md-eqmain">${t}</span></div>`;
          })
          .join("")}
      </div>`;
    }
  }

  // fallback: original pre
  // 最后兜底：纯数字网格仍转矩阵，避免残留 ASCII 表
  if (!codeLike) {
    const onlyNums = [];
    let hasText = false;
    lines.forEach((l) => {
      if (/for |while |def |class |#include|printf|malloc|import |=>|sudo |apt |gcc /.test(l)) hasText = true;
      const r = parseNumRow(l);
      if (r) onlyNums.push(r);
      else if (l.trim() && !/^[=\-+←←·×\[\]│┌┐└┘\s\d.]+$/.test(l) && !/^\s*$/.test(l)) hasText = true;
    });
    if (!hasText && onlyNums.length >= 2) {
      return `<div class="md-math-block"><div class="md-math-row">${matrixHtml(onlyNums)}</div></div>`;
    }
  }
  return `<pre><code>${escapeHtml(raw)}</code></pre>`;
}

function mdToHtml(md) {
  md = md.replace(/^\uFEFF/, "");
  // 去掉源码里的 HTML 注释标记（如 <!-- BEGINNER_EXERCISES -->），它们不该出现在正文
  md = md.replace(/^<!--[\s\S]*?-->$/gm, "");
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0, inCode = false, codeBuf = [], inUl = false, inTable = false, tableBuf = [];
  const flushUl = () => { if (inUl) { out.push("</ul>"); inUl = false; } };
  const inline = (s) => {
    let t = escapeHtml(s);
    t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
    t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
    return t;
  };
  const flushTable = () => {
    if (!inTable) return;
    const rows = tableBuf.filter((r) => r.trim());
    // 单元格内的 \| 是转义竖线，不能当列分隔符；先换占位符再切分
    const splitRow = (r) =>
      r.trim().replace(/^\|/, "").replace(/\|$/, "")
        .replace(/\\\|/g, "\u0000PIPE\u0000")
        .split("|")
        .map((c) => c.replace(/\u0000PIPE\u0000/g, "|").trim());
    const body = rows
      .filter((r) => !/^\|[\s|:-]+\|$/.test(r.replace(/\s/g, "")) && !/^\|[\s|:-]+\|$/.test(r))
      .map(splitRow);
    if (body.length) {
      const head = body[0], rest = body.slice(1);
      out.push('<div class="md-table-wrap"><table class="md-table"><thead><tr>');
      head.forEach((h) => out.push(`<th>${inline(h)}</th>`));
      out.push("</tr></thead><tbody>");
      rest.forEach((row) => {
        out.push("<tr>");
        row.forEach((c) => out.push(`<td>${inline(c)}</td>`));
        out.push("</tr>");
      });
      out.push("</tbody></table></div>");
    }
    tableBuf = []; inTable = false;
  };
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "<details>") {
      let j = i + 1;
      while (j < lines.length && lines[j].trim() !== "</details>") j++;
      const block = lines.slice(i + 1, j);
      const summaryLine = block.find((x) => /<summary>.*<\/summary>/.test(x)) || "";
      const summary = summaryLine.replace(/^\s*<summary>/, "").replace(/<\/summary>\s*$/, "");
      const body = block.filter((x) => x !== summaryLine).join("\n");
      out.push(`<details class="md-details"><summary>${inline(summary)}</summary>${mdToHtml(body)}</details>`);
      i = Math.min(j + 1, lines.length);
      continue;
    }
    if (line.startsWith("```")) {
      flushUl(); flushTable();
      if (!inCode) { inCode = true; codeBuf = []; }
      else {
        const raw = codeBuf.join("\n");
        out.push(renderCodeBlock(raw));
        inCode = false;
      }
      i++; continue;
    }
    if (inCode) { codeBuf.push(line); i++; continue; }
    if (/^\|/.test(line)) {
      flushUl();
      if (!inTable) inTable = true;
      tableBuf.push(line); i++; continue;
    } else if (inTable) flushTable();
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flushUl();
      const level = h[1].length;
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      i++; continue;
    }
    if (line.startsWith(">")) {
      flushUl();
      const parts = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        parts.push(inline(lines[i].replace(/^>\s?/, ""))); i++;
      }
      out.push(`<blockquote>${parts.join("<br/>")}</blockquote>`);
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inUl) { out.push("<ul>"); inUl = true; }
      out.push(`<li>${inline(line.replace(/^\s*[-*]\s+/, ""))}</li>`); i++; continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      flushUl();
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ""))}</li>`); i++;
      }
      out.push(`<ol>${items.join("")}</ol>`); continue;
    }
    if (/^\s*$/.test(line)) { flushUl(); i++; continue; }
    if (/^---+\s*$/.test(line)) { flushUl(); out.push('<hr class="md-hr"/>'); i++; continue; }
    flushUl();
    const para = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^#{1,4}\s/.test(lines[i]) &&
      !/^```/.test(lines[i]) && !/^\|/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) && !lines[i].startsWith(">") && !/^---+\s*$/.test(lines[i])) {
      para.push(inline(lines[i])); i++;
    }
    if (para.length) out.push(`<p>${para.join(" ")}</p>`);
  }
  flushUl(); flushTable();
  if (inCode) out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
  return out.join("\n");
}

const items = LECTURES.map((L) => {
  const raw = fs.readFileSync(path.join(root, L.file), "utf8");
  return { id: L.id, stage: L.stage, title: L.title, file: L.file, demos: L.demos, html: mdToHtml(raw) };
});
const js = "/* auto-generated — node _build_lectures.cjs */\nwindow.LECTURES = " + JSON.stringify(items) + ";\n";
fs.writeFileSync(path.join(root, "lectures.js"), js, "utf8");
console.log("ok", items.length, js.length);
