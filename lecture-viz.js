/* 讲义可视化块 — 与 NPU Lab 铜色/仪表风格一致，注入阅读器 */
(function () {
  const V = {};

  const wrap = (title, svg, caption) =>
    `<figure class="lect-viz">
      <div class="lect-viz-head micro">${title}</div>
      ${svg}
      ${caption ? `<figcaption>${caption}</figcaption>` : ""}
    </figure>`;

  /* ── 01 第1~2课 ── */
  V.l01a = wrap(
    "NEURON · MAC",
    `<svg viewBox="0 0 640 200" class="lv-svg" role="img" aria-label="神经元MAC">
      <rect width="640" height="200" fill="#0a0910" stroke="#2c2839"/>
      <text x="20" y="28" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">x</text>
      <circle cx="80" cy="100" r="22" fill="none" stroke="#d4895a" stroke-width="2"/>
      <text x="80" y="105" text-anchor="middle" fill="#f0b07a" font-size="14" font-family="Segoe UI">x₁</text>
      <circle cx="80" cy="160" r="22" fill="none" stroke="#d4895a" stroke-width="2"/>
      <text x="80" y="165" text-anchor="middle" fill="#f0b07a" font-size="14">x₂</text>
      <path d="M102 100 H180 M102 160 H180" stroke="#d4895a" stroke-width="1.5" marker-end="url(#a1)"/>
      <rect x="180" y="88" width="120" height="90" rx="3" fill="#12111a" stroke="#d4895a"/>
      <text x="240" y="120" text-anchor="middle" fill="#ede8f5" font-size="13">Σ w·x + b</text>
      <text x="240" y="145" text-anchor="middle" fill="#d4895a" font-size="12" font-family="Cascadia Code,Consolas,monospace">MAC</text>
      <text x="240" y="165" text-anchor="middle" fill="#918aa3" font-size="11">乘累加</text>
      <path d="M300 133 H360" stroke="#d4895a" stroke-width="1.5"/>
      <rect x="360" y="108" width="90" height="50" rx="3" fill="#12111a" stroke="#5bbf9a"/>
      <text x="405" y="138" text-anchor="middle" fill="#5bbf9a" font-size="13">ReLU</text>
      <path d="M450 133 H510" stroke="#5bbf9a" stroke-width="1.5"/>
      <rect x="510" y="115" width="80" height="36" rx="3" fill="#0e1418" stroke="#5bbf9a"/>
      <text x="550" y="138" text-anchor="middle" fill="#ede8f5" font-size="13">y</text>
      <defs><marker id="a1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#d4895a"/></marker></defs>
    </svg>`,
    "一个神经元 = 一次乘加；ReLU 只是比较器。NPU 把成千上万个 MAC 排成阵列。"
  );

  V.l01a2 = `
    <figure class="lect-viz lect-viz-live">
      <div class="lect-viz-head micro">CONV LIVE · 3×3 × 2×2 · 点输出格子切窗口</div>
      <div class="lv-conv">
        <div>
          <div class="micro">输入</div>
          <div class="matrix input-matrix" id="lv-conv-in"></div>
        </div>
        <div class="op">×</div>
        <div>
          <div class="micro">核</div>
          <div class="matrix kernel-matrix" id="lv-conv-k"></div>
        </div>
        <div class="op">→</div>
        <div>
          <div class="micro">输出</div>
          <div class="matrix output-matrix" id="lv-conv-out"></div>
        </div>
      </div>
      <div class="readout" id="lv-conv-formula">1×1+2×2+4×3+5×4 = 37</div>
      <figcaption>点输出 37/47/67/77 切换窗口。参数只有核里 4 个数（权重共享）；计算量随窗口涨。</figcaption>
    </figure>`;

  V.l01b = wrap(
    "DOT · 默契度几何",
    `<svg viewBox="0 0 640 200" class="lv-svg">
      <rect width="640" height="200" fill="#0a0910" stroke="#2c2839"/>
      <text x="24" y="32" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">a·b = |a||b| cosθ</text>
      <line x1="60" y1="150" x2="200" y2="150" stroke="#d4895a" stroke-width="2"/>
      <polygon points="200,150 190,145 190,155" fill="#d4895a"/>
      <text x="210" y="155" fill="#f0b07a" font-size="12">a</text>
      <line x1="60" y1="150" x2="170" y2="70" stroke="#5bbf9a" stroke-width="2"/>
      <polygon points="170,70 158,78 166,82" fill="#5bbf9a"/>
      <text x="175" y="68" fill="#5bbf9a" font-size="12">b</text>
      <path d="M100 150 A40 40 0 0 0 95 120" fill="none" stroke="#918aa3"/>
      <text x="108" y="128" fill="#918aa3" font-size="11">θ</text>
      <text x="300" y="70" fill="#5bbf9a" font-size="13">同向 → 点积大</text>
      <text x="300" y="100" fill="#918aa3" font-size="13">垂直 → 0</text>
      <text x="300" y="130" fill="#e85d7a" font-size="13">反向 → 负</text>
      <text x="300" y="170" fill="#d4895a" font-size="12" font-family="Cascadia Code,Consolas,monospace">MAC = 点积的电路实现</text>
    </svg>`,
    "神经元检测特征 = 权重方向和输入方向有多「像」。"
  );

  V.l01b2 = wrap(
    "GEMM · 一行 = 一个神经元",
    `<svg viewBox="0 0 640 220" class="lv-svg">
      <rect width="640" height="220" fill="#0a0910" stroke="#2c2839"/>
      <g transform="translate(40,50)">
        <text x="0" y="-12" fill="#d4895a" font-size="11" font-family="Cascadia Code,Consolas,monospace">W 4×3</text>
        ${[0,1,2,3].map(i=>`<rect x="0" y="${i*32}" width="120" height="28" fill="${i===0?"rgba(212,137,90,0.2)":"#12111a"}" stroke="${i===0?"#d4895a":"#2c2839"}"/><text x="60" y="${i*32+18}" text-anchor="middle" fill="${i===0?"#f0b07a":"#b0b8c8"}" font-size="11" font-family="Cascadia Code,Consolas,monospace">row${i}</text>`).join("")}
      </g>
      <text x="180" y="120" fill="#d4895a" font-size="18">×</text>
      <g transform="translate(220,70)">
        <text x="0" y="-12" fill="#d4895a" font-size="11" font-family="Cascadia Code,Consolas,monospace">x 3×1</text>
        ${[0,1,2].map(i=>`<rect x="${i*36}" y="0" width="32" height="100" fill="#12111a" stroke="#2c2839"/><text x="${i*36+16}" y="55" text-anchor="middle" fill="#ede8f5" font-size="14" font-family="Cascadia Code,Consolas,monospace">${[9,6,3][i]}</text>`).join("")}
      </g>
      <text x="360" y="120" fill="#d4895a" font-size="18">=</text>
      <g transform="translate(400,70)">
        <text x="0" y="-12" fill="#5bbf9a" font-size="11" font-family="Cascadia Code,Consolas,monospace">y 4×1</text>
        ${[0,1,2,3].map(i=>`<rect x="0" y="${i*28}" width="80" height="24" fill="${i===0?"rgba(91,191,154,0.15)":"#0e0d16"}" stroke="${i===0?"#5bbf9a":"#2c2839"}"/><text x="40" y="${i*28+16}" text-anchor="middle" fill="${i===0?"#5bbf9a":"#918aa3"}" font-size="12" font-family="Cascadia Code,Consolas,monospace">y${i}</text>`).join("")}
      </g>
      <text x="40" y="200" fill="#918aa3" font-size="12">高亮 row0：和 x 点积 → y0。四行可并行 = 四组 MAC。</text>
    </svg>`,
    "这就是全连接层。阵列按行铺开，每拍可以吃多个点积。"
  );

  /* ── 01 第3课 池化/BN ── */
  V.l01c = wrap(
    "POOL · 无权重",
    `<svg viewBox="0 0 640 200" class="lv-svg">
      <rect width="640" height="200" fill="#0a0910" stroke="#2c2839"/>
      <g transform="translate(48,40)">
        ${[1,3,2,4,5,6,8,7,9,0,1,2,3,4,5,6].map((v,i)=>{
          const x=(i%4)*40, y=Math.floor(i/4)*40;
          const sel=i<6 && (i%4<2) && Math.floor(i/4)<2;
          return `<rect x="${x}" y="${y}" width="36" height="36" fill="${sel?"rgba(212,137,90,0.18)":"#1a1824"}" stroke="${sel?"#d4895a":"#2c2839"}"/><text x="${x+18}" y="${y+24}" text-anchor="middle" fill="${sel?"#f0b07a":"#b0b8c8"}" font-size="13" font-family="Cascadia Code,Consolas,monospace">${v}</text>`;
        }).join("")}
      </g>
      <text x="48" y="30" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">4×4 · 2×2 窗 stride=2</text>
      <text x="240" y="110" fill="#d4895a" font-size="16">→ max →</text>
      <g transform="translate(340,70)">
        <rect x="0" y="0" width="44" height="44" fill="rgba(91,191,154,0.12)" stroke="#5bbf9a"/>
        <text x="22" y="30" text-anchor="middle" fill="#5bbf9a" font-size="18" font-family="Cascadia Code,Consolas,monospace">6</text>
        <rect x="52" y="0" width="44" height="44" fill="#0e0d16" stroke="#2c2839"/>
        <text x="74" y="30" text-anchor="middle" fill="#918aa3" font-size="16">?</text>
        <rect x="0" y="52" width="44" height="44" fill="#0e0d16" stroke="#2c2839"/>
        <text x="22" y="82" text-anchor="middle" fill="#918aa3" font-size="16">?</text>
        <rect x="52" y="52" width="44" height="44" fill="#0e0d16" stroke="#2c2839"/>
        <text x="74" y="82" text-anchor="middle" fill="#918aa3" font-size="16">?</text>
      </g>
      <text x="480" y="100" fill="#918aa3" font-size="12">池化 = 比较器</text>
      <text x="480" y="120" fill="#918aa3" font-size="12">没有权重</text>
    </svg>`,
    "Max 取窗口最显著响应；硬件只是比较器树，不是 MAC 阵列。"
  );

  V.l01c2 = wrap(
    "BN FOLD · 推理时消失",
    `<svg viewBox="0 0 640 180" class="lv-svg">
      <rect width="640" height="180" fill="#0a0910" stroke="#2c2839"/>
      <text x="24" y="36" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">训练图</text>
      <rect x="24" y="56" width="100" height="44" rx="3" fill="#12111a" stroke="#d4895a"/>
      <text x="74" y="83" text-anchor="middle" fill="#f0b07a" font-size="14">Conv</text>
      <path d="M124 78 H150" stroke="#d4895a"/>
      <rect x="150" y="56" width="80" height="44" rx="3" fill="#12111a" stroke="#b0b8c8"/>
      <text x="190" y="83" text-anchor="middle" fill="#ede8f5" font-size="14">BN</text>
      <path d="M230 78 H256" stroke="#b0b8c8"/>
      <rect x="256" y="56" width="90" height="44" rx="3" fill="#12111a" stroke="#5bbf9a"/>
      <text x="301" y="83" text-anchor="middle" fill="#5bbf9a" font-size="14">ReLU</text>
      <text x="380" y="83" fill="#d4895a" font-size="20">⇒</text>
      <text x="430" y="36" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">推理图 · BN 折进权重</text>
      <rect x="430" y="56" width="120" height="44" rx="3" fill="rgba(212,137,90,0.12)" stroke="#d4895a"/>
      <text x="490" y="83" text-anchor="middle" fill="#f0b07a" font-size="14">Conv′</text>
      <path d="M550 78 H570" stroke="#d4895a"/>
      <rect x="570" y="56" width="56" height="44" rx="3" fill="#12111a" stroke="#5bbf9a"/>
      <text x="598" y="83" text-anchor="middle" fill="#5bbf9a" font-size="13">ReLU</text>
      <text x="24" y="140" fill="#918aa3" font-size="12" font-family="Cascadia Code,Consolas,monospace">y = γ(Wx−μ)/σ+β = (γ/σ)W·x + (β−γμ/σ)  →  无独立 BN 电路</text>
    </svg>`,
    "推理时 BN 常数可并入卷积；所以 NPU 框图里找不到 BN 单元。"
  );

  /* ── 02 量化 ── */
  V.l02a = wrap(
    "INT8 GRID · 误差 ≤ s/2",
    `<svg viewBox="0 0 640 170" class="lv-svg">
      <rect width="640" height="170" fill="#0a0910" stroke="#2c2839"/>
      <line x1="40" y1="90" x2="600" y2="90" stroke="#d4895a" stroke-width="2"/>
      ${Array.from({length:17},(_,i)=>{
        const x=40+i*35;
        return `<line x1="${x}" y1="78" x2="${x}" y2="102" stroke="#2c2839"/>`;
      }).join("")}
      <circle cx="40+${0}" cy="70" r="5" fill="#ede8f5"/>
      <circle cx="220" cy="70" r="5" fill="#ede8f5"/>
      <text x="220" y="56" text-anchor="middle" fill="#ede8f5" font-size="11" font-family="Cascadia Code,Consolas,monospace">w=0.62</text>
      <circle cx="220" cy="118" r="5" fill="#5bbf9a"/>
      <text x="220" y="140" text-anchor="middle" fill="#5bbf9a" font-size="11" font-family="Cascadia Code,Consolas,monospace">q=62 → 0.625</text>
      <text x="40" y="140" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">−max</text>
      <text x="560" y="140" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">+max</text>
      <text x="40" y="36" fill="#f0b07a" font-size="12" font-family="Cascadia Code,Consolas,monospace">s = max|w|/127 · 浮点连续 → 256 格</text>
    </svg>`,
    "量化 = 把连续范围切成等宽格；四舍五入最多偏半格。离群点会把 s 拉大。"
  );

  V.l02b = wrap(
    "CPU vs NPU · 同一层 0.17 GOP",
    `<svg viewBox="0 0 640 200" class="lv-svg">
      <rect width="640" height="200" fill="#0a0910" stroke="#2c2839"/>
      <text x="24" y="32" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">RESNET L1 · 224²×3 → 64×3×3</text>
      <text x="24" y="70" fill="#f0b07a" font-size="12">CPU 实际 ~5–15 ms</text>
      <rect x="24" y="82" width="520" height="18" fill="#1a1824" stroke="#2c2839"/>
      <rect x="24" y="82" width="480" height="18" fill="#c47a3a" opacity="0.85"/>
      <text x="24" y="130" fill="#5bbf9a" font-size="12">NPU 单核 ~0.15–0.3 ms</text>
      <rect x="24" y="142" width="520" height="18" fill="#1a1824" stroke="#2c2839"/>
      <rect x="24" y="142" width="28" height="18" fill="#5bbf9a"/>
      <text x="560" y="130" fill="#5bbf9a" font-size="12" font-family="Cascadia Code,Consolas,monospace">50–100×</text>
    </svg>`,
    "1 MAC=2 ops；NPU 无指令流、MAC 阵列吃满时快一个数量级以上。"
  );

  /* ── 03 MAC / 存储 ── */
  V.l03a = wrap(
    "NPU CORE · 数据流",
    `<svg viewBox="0 0 640 260" class="lv-svg">
      <rect width="640" height="260" fill="#0a0910" stroke="#2c2839"/>
      <rect x="24" y="40" width="120" height="70" rx="3" fill="#12111a" stroke="#2c2839"/>
      <text x="84" y="70" text-anchor="middle" fill="#ede8f5" font-size="13">权重/激活</text>
      <text x="84" y="90" text-anchor="middle" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">SRAM</text>
      <path d="M144 75 H180" stroke="#d4895a" stroke-width="1.5"/>
      <rect x="180" y="30" width="160" height="90" rx="3" fill="rgba(212,137,90,0.1)" stroke="#d4895a"/>
      <text x="260" y="60" text-anchor="middle" fill="#f0b07a" font-size="14">MAC 32×32</text>
      <text x="260" y="82" text-anchor="middle" fill="#d4895a" font-size="12" font-family="Cascadia Code,Consolas,monospace">1024 INT8/拍</text>
      <text x="260" y="102" text-anchor="middle" fill="#918aa3" font-size="11">≈2 TOPS @1GHz</text>
      <path d="M340 75 H370" stroke="#d4895a"/>
      <rect x="370" y="48" width="80" height="54" rx="3" fill="#12111a" stroke="#2c2839"/>
      <text x="410" y="80" text-anchor="middle" fill="#ede8f5" font-size="12">INT32 Σ</text>
      <path d="M450 75 H480" stroke="#5bbf9a"/>
      <rect x="480" y="48" width="120" height="54" rx="3" fill="#12111a" stroke="#5bbf9a"/>
      <text x="540" y="70" text-anchor="middle" fill="#5bbf9a" font-size="12">ReLU / Pool</text>
      <text x="540" y="88" text-anchor="middle" fill="#918aa3" font-size="11">固定功能</text>
      <rect x="24" y="160" width="140" height="60" rx="3" fill="#12111a" stroke="#2c2839"/>
      <text x="94" y="186" text-anchor="middle" fill="#ede8f5" font-size="13">DMA</text>
      <text x="94" y="206" text-anchor="middle" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">DDR ↔ on-chip</text>
      <rect x="200" y="160" width="160" height="60" rx="3" fill="#12111a" stroke="#2c2839"/>
      <text x="280" y="186" text-anchor="middle" fill="#ede8f5" font-size="13">任务控制器</text>
      <text x="280" y="206" text-anchor="middle" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">task list ← .rknn</text>
      <path d="M94 160 V130" stroke="#2c2839" stroke-dasharray="3 3"/>
      <path d="M280 160 V130" stroke="#2c2839" stroke-dasharray="3 3"/>
    </svg>`,
    "设计艺术 = 让上千乘法器每拍都有数据。ReLU/池化几乎白送；BN 已折叠。"
  );

  V.l03b = wrap(
    "MEMORY PYRAMID · 算力便宜带宽贵",
    `<svg viewBox="0 0 640 220" class="lv-svg">
      <rect width="640" height="220" fill="#0a0910" stroke="#2c2839"/>
      <polygon points="320,30 420,90 220,90" fill="rgba(212,137,90,0.25)" stroke="#d4895a"/>
      <text x="320" y="70" text-anchor="middle" fill="#f0b07a" font-size="11" font-family="Cascadia Code,Consolas,monospace">累加器 ns</text>
      <polygon points="210,100 430,100 480,150 160,150" fill="rgba(212,137,90,0.12)" stroke="#d4895a"/>
      <text x="320" y="130" text-anchor="middle" fill="#ede8f5" font-size="12">片上缓冲 ~384KB · TB/s 级</text>
      <polygon points="150,160 490,160 540,200 100,200" fill="#1a1824" stroke="#2c2839"/>
      <text x="320" y="186" text-anchor="middle" fill="#918aa3" font-size="12">DDR LPDDR · ~34 GB/s · GB 级</text>
      <text x="24" y="30" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">快/贵 ↑</text>
      <text x="540" y="210" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">慢/便宜 →</text>
    </svg>`,
    "例：输出 3.2MB 写回 DDR ~100µs > 计算 87µs → 瓶颈在搬运。片上级联/tiling 就是为这个。"
  );

  /* ── 04 部署 ── */
  V.l04a = wrap(
    "DEPLOY 5-STEP",
    `<svg viewBox="0 0 640 140" class="lv-svg">
      <rect width="640" height="140" fill="#0a0910" stroke="#2c2839"/>
      ${[
        ["训练","PT/TF"],
        ["ONNX","中间格式"],
        [".rknn","Toolkit2"],
        ["推板","adb"],
        ["推理","librknnrt"]
      ].map((s,i)=>{
        const x=24+i*122;
        const on=i===2;
        return `<rect x="${x}" y="40" width="108" height="56" rx="3" fill="${on?"rgba(212,137,90,0.15)":"#12111a"}" stroke="${on?"#d4895a":"#2c2839"}"/>
        <text x="${x+54}" y="64" text-anchor="middle" fill="${on?"#f0b07a":"#ede8f5"}" font-size="13">${s[0]}</text>
        <text x="${x+54}" y="84" text-anchor="middle" fill="#918aa3" font-size="10" font-family="Cascadia Code,Consolas,monospace">${s[1]}</text>
        ${i<4?`<path d="M${x+108} 68 H${x+122}" stroke="#d4895a" opacity="0.5"/>`:""}`;
      }).join("")}
      <text x="24" y="30" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">.rknn = 绑定芯片的任务包，不是通用格式</text>
    </svg>`,
    "config 指定 target_platform；build 内部做 PTQ 校准。换芯片只改一个字符串，要重转。"
  );

  /* ── 06 注意力 / Transformer ── */
  V.l06b = wrap(
    "ATTENTION · Q·Kᵀ → softmax → AV",
    `<svg viewBox="0 0 640 210" class="lv-svg">
      <rect width="640" height="210" fill="#0a0910" stroke="#2c2839"/>
      ${["我","爱","猫"].map((t,i)=>{
        const x=40+i*70;
        return `<rect x="${x}" y="50" width="56" height="40" rx="3" fill="${i===1?"rgba(212,137,90,0.2)":"#12111a"}" stroke="${i===1?"#d4895a":"#2c2839"}"/>
        <text x="${x+28}" y="76" text-anchor="middle" fill="${i===1?"#f0b07a":"#ede8f5"}" font-size="16">${t}</text>`;
      }).join("")}
      <text x="40" y="40" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">词向量</text>
      <path d="M280 70 H320" stroke="#d4895a"/>
      <rect x="320" y="40" width="140" height="60" rx="3" fill="#12111a" stroke="#d4895a"/>
      <text x="390" y="66" text-anchor="middle" fill="#f0b07a" font-size="13">Q · Kᵀ</text>
      <text x="390" y="86" text-anchor="middle" fill="#918aa3" font-size="11">点积相关度</text>
      <path d="M460 70 H500" stroke="#d4895a"/>
      <rect x="500" y="40" width="110" height="60" rx="3" fill="#12111a" stroke="#5bbf9a"/>
      <text x="555" y="66" text-anchor="middle" fill="#5bbf9a" font-size="13">softmax</text>
      <text x="555" y="86" text-anchor="middle" fill="#918aa3" font-size="11">权重和=1</text>
      <text x="40" y="140" fill="#918aa3" font-size="12">「爱」→ 权重 [0.21, 0.58, 0.21] → 新表示 ≈ [0.79, 0.79]</text>
      <text x="40" y="170" fill="#d4895a" font-size="12" font-family="Cascadia Code,Consolas,monospace">N 词 → N² 相关度 · 上下文×2 → 算力×4</text>
      <text x="40" y="195" fill="#918aa3" font-size="11">底层仍是矩阵乘 —— NPU 最喜欢的形状</text>
    </svg>`,
    "查资料类比：Q=问题，K=标题，V=内容。看得远因为与距离无关；贵因为 N²。"
  );

  V.l06c = wrap(
    "TRANSFORMER BLOCK",
    `<svg viewBox="0 0 640 280" class="lv-svg">
      <rect width="640" height="280" fill="#0a0910" stroke="#2c2839"/>
      <rect x="240" y="24" width="160" height="36" rx="3" fill="#12111a" stroke="#2c2839"/>
      <text x="320" y="47" text-anchor="middle" fill="#ede8f5" font-size="13">输入 x</text>
      <path d="M320 60 V80" stroke="#d4895a"/>
      <rect x="200" y="80" width="240" height="40" rx="3" fill="rgba(212,137,90,0.1)" stroke="#d4895a"/>
      <text x="320" y="105" text-anchor="middle" fill="#f0b07a" font-size="14">自注意力</text>
      <path d="M440 100 H500 V160 H440" fill="none" stroke="#918aa3" stroke-dasharray="3 3"/>
      <path d="M320 120 V140" stroke="#d4895a"/>
      <circle cx="320" cy="152" r="12" fill="none" stroke="#d4895a"/>
      <text x="320" y="157" text-anchor="middle" fill="#d4895a" font-size="12">+</text>
      <path d="M320 164 V184" stroke="#d4895a"/>
      <rect x="230" y="184" width="180" height="32" rx="3" fill="#12111a" stroke="#b0b8c8"/>
      <text x="320" y="205" text-anchor="middle" fill="#ede8f5" font-size="13">LN</text>
      <path d="M320 216 V232" stroke="#d4895a"/>
      <rect x="200" y="232" width="240" height="36" rx="3" fill="rgba(91,191,154,0.08)" stroke="#5bbf9a"/>
      <text x="320" y="255" text-anchor="middle" fill="#5bbf9a" font-size="13">MLP · 两块大 GEMM</text>
      <text x="24" y="48" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">残差 = 原稿+修改</text>
      <text x="24" y="260" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">块 × N = 深度</text>
    </svg>`,
    "位置编码把「第几个」混进词向量，否则「猫追狗」和「狗追猫」分不清。"
  );

  V.l06a = wrap(
    "PREFILL vs DECODE",
    `<svg viewBox="0 0 640 180" class="lv-svg">
      <rect width="640" height="180" fill="#0a0910" stroke="#2c2839"/>
      <rect x="24" y="40" width="200" height="100" rx="3" fill="rgba(212,137,90,0.1)" stroke="#d4895a"/>
      <text x="124" y="70" text-anchor="middle" fill="#f0b07a" font-size="14">Prefill</text>
      <text x="124" y="95" text-anchor="middle" fill="#ede8f5" font-size="12">一次吃完整段 prompt</text>
      <text x="124" y="118" text-anchor="middle" fill="#918aa3" font-size="11">瓶颈：算力+带宽</text>
      <rect x="260" y="40" width="200" height="100" rx="3" fill="rgba(91,191,154,0.08)" stroke="#5bbf9a"/>
      <text x="360" y="70" text-anchor="middle" fill="#5bbf9a" font-size="14">Decode</text>
      <text x="360" y="95" text-anchor="middle" fill="#ede8f5" font-size="12">每步 1 个新 token</text>
      <text x="360" y="118" text-anchor="middle" fill="#918aa3" font-size="11">瓶颈：带宽 + KV 容量</text>
      <text x="490" y="70" fill="#d4895a" font-size="12" font-family="Cascadia Code,Consolas,monospace">首字延迟</text>
      <text x="490" y="100" fill="#5bbf9a" font-size="12" font-family="Cascadia Code,Consolas,monospace">tokens/s</text>
      <text x="24" y="30" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">端侧 LLM 先看 tokens/s，再谈 TOPS</text>
    </svg>`,
    "rknn-llm 的 benchmark 就是 tokens/s。Decode 更像访存问题。"
  );

  /* ── 07 Linux / SoC ── */
  V.l07a = wrap(
    "MCU → LINUX",
    `<svg viewBox="0 0 640 160" class="lv-svg">
      <rect width="640" height="160" fill="#0a0910" stroke="#2c2839"/>
      <rect x="24" y="40" width="260" height="90" rx="3" fill="#12111a" stroke="#2c2839"/>
      <text x="154" y="70" text-anchor="middle" fill="#ede8f5" font-size="14">MCU：我拥有整台机器</text>
      <text x="154" y="100" text-anchor="middle" fill="#918aa3" font-size="12">while(1) · 直接摸寄存器 · 烧 hex</text>
      <text x="310" y="95" fill="#d4895a" font-size="18">→</text>
      <rect x="340" y="40" width="276" height="90" rx="3" fill="rgba(212,137,90,0.08)" stroke="#d4895a"/>
      <text x="478" y="70" text-anchor="middle" fill="#f0b07a" font-size="14">Linux：OS 拥有机器，你是租户</text>
      <text x="478" y="100" text-anchor="middle" fill="#918aa3" font-size="12">进程 · 驱动 · /dev · apt · ssh</text>
    </svg>`,
    "NPU 这种复杂 SoC 没有 OS 玩不转。原则：只学部署够用的 Linux。"
  );

  V.l07b = wrap(
    "SOC · 多主抢 DDR",
    `<svg viewBox="0 0 640 200" class="lv-svg">
      <rect width="640" height="200" fill="#0a0910" stroke="#2c2839"/>
      ${["CPU","GPU","NPU","VPU","RGA"].map((t,i)=>{
        const x=30+i*120;
        return `<rect x="${x}" y="36" width="100" height="40" rx="3" fill="${t==="NPU"?"rgba(212,137,90,0.15)":"#12111a"}" stroke="${t==="NPU"?"#d4895a":"#2c2839"}"/>
        <text x="${x+50}" y="61" text-anchor="middle" fill="${t==="NPU"?"#f0b07a":"#ede8f5"}" font-size="13">${t}</text>
        <path d="M${x+50} 76 V110" stroke="#2c2839"/>`;
      }).join("")}
      <rect x="40" y="110" width="560" height="28" rx="3" fill="#1a1824" stroke="#2c2839"/>
      <text x="320" y="129" text-anchor="middle" fill="#918aa3" font-size="12">互联 / IOMMU</text>
      <path d="M320 138 V158" stroke="#d4895a"/>
      <rect x="200" y="158" width="240" height="28" rx="3" fill="rgba(212,137,90,0.12)" stroke="#d4895a"/>
      <text x="320" y="177" text-anchor="middle" fill="#f0b07a" font-size="13">DDR · 公共仓库 · 会堵车</text>
    </svg>`,
    "DDR 是全 SoC 公共仓库。NPU 满载还要和 CPU/GPU/视频抢带宽。"
  );

  V.l07c = wrap(
    "DRIVER STACK",
    `<svg viewBox="0 0 640 200" class="lv-svg">
      <rect width="640" height="200" fill="#0a0910" stroke="#2c2839"/>
      <rect x="160" y="24" width="320" height="36" rx="3" fill="#12111a" stroke="#2c2839"/>
      <text x="320" y="47" text-anchor="middle" fill="#ede8f5" font-size="13">你的应用 app</text>
      <path d="M320 60 V78" stroke="#d4895a"/>
      <rect x="160" y="78" width="320" height="36" rx="3" fill="rgba(212,137,90,0.1)" stroke="#d4895a"/>
      <text x="320" y="101" text-anchor="middle" fill="#f0b07a" font-size="13">librknnrt.so · 解析 .rknn · ioctl</text>
      <path d="M320 114 V132" stroke="#d4895a"/>
      <rect x="160" y="132" width="320" height="36" rx="3" fill="#12111a" stroke="#b0b8c8"/>
      <text x="320" y="155" text-anchor="middle" fill="#ede8f5" font-size="13">rknpu 驱动 · 上电/映射/递交</text>
      <path d="M320 168 V186" stroke="#2c2839"/>
      <text x="320" y="198" text-anchor="middle" fill="#918aa3" font-size="12" font-family="Cascadia Code,Consolas,monospace">NPU HW · npu@27700000 · 双核</text>
    </svg>`,
    "用户态不碰寄存器。设备树描述硬件；排查看 version / load / dmesg。"
  );

  /* 数电补课 */
  V.l08a = wrap(
    "MULT TREE · 位宽↑ 树深↑",
    `<svg viewBox="0 0 640 220" class="lv-svg">
      <rect width="640" height="220" fill="#0a0910" stroke="#2c2839"/>
      <text x="24" y="28" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">PARTIAL PRODUCTS → TREE → PRODUCT</text>
      <rect x="48" y="48" width="72" height="28" fill="rgba(212,137,90,0.2)" stroke="#d4895a"/>
      <text x="84" y="67" text-anchor="middle" fill="#f0b07a" font-size="12">pp0</text>
      <rect x="132" y="48" width="72" height="28" fill="rgba(212,137,90,0.2)" stroke="#d4895a"/>
      <text x="168" y="67" text-anchor="middle" fill="#f0b07a" font-size="12">pp1</text>
      <rect x="216" y="48" width="72" height="28" fill="rgba(212,137,90,0.2)" stroke="#d4895a"/>
      <text x="252" y="67" text-anchor="middle" fill="#f0b07a" font-size="12">pp2</text>
      <rect x="300" y="48" width="72" height="28" fill="rgba(212,137,90,0.2)" stroke="#d4895a"/>
      <text x="336" y="67" text-anchor="middle" fill="#f0b07a" font-size="12">pp3</text>
      <line x1="84" y1="76" x2="84" y2="100" stroke="#d4895a"/>
      <line x1="168" y1="76" x2="168" y2="100" stroke="#d4895a"/>
      <line x1="252" y1="76" x2="252" y2="100" stroke="#d4895a"/>
      <line x1="336" y1="76" x2="336" y2="100" stroke="#d4895a"/>
      <line x1="84" y1="100" x2="252" y2="100" stroke="#d4895a"/>
      <line x1="126" y1="100" x2="126" y2="118" stroke="#d4895a"/>
      <line x1="210" y1="100" x2="210" y2="118" stroke="#d4895a"/>
      <rect x="70" y="118" width="112" height="28" fill="#12111a" stroke="#d4895a"/>
      <text x="126" y="137" text-anchor="middle" fill="#f0b07a" font-size="12">Σ / CSA</text>
      <line x1="126" y1="146" x2="126" y2="168" stroke="#d4895a"/>
      <rect x="60" y="168" width="132" height="32" fill="rgba(91,191,154,0.12)" stroke="#5bbf9a"/>
      <text x="126" y="189" text-anchor="middle" fill="#5bbf9a" font-size="13">乘积 INT16/32</text>
      <rect x="400" y="56" width="200" height="36" rx="3" fill="#12111a" stroke="#2c2839"/>
      <text x="500" y="79" text-anchor="middle" fill="#ede8f5" font-size="13">8×8 · 树浅 · 面积小</text>
      <rect x="400" y="104" width="200" height="36" rx="3" fill="#12111a" stroke="#2c2839"/>
      <text x="500" y="127" text-anchor="middle" fill="#d4895a" font-size="13">FP32 尾数 · 树更深</text>
      <rect x="400" y="152" width="200" height="36" rx="3" fill="#12111a" stroke="#2c2839"/>
      <text x="500" y="175" text-anchor="middle" fill="#918aa3" font-size="12" font-family="Cascadia Code,Consolas,monospace">点积累加 → INT32</text>
    </svg>`,
    "INT8 便宜 = 乘法树更浅。点积还要加法树/长累加链，防的是「加」不是「乘」。"
  );

  V.l08b = wrap(
    "DOUBLE BUFFER · 搬算重叠",
    `<svg viewBox="0 0 640 200" class="lv-svg">
      <rect width="640" height="200" fill="#0a0910" stroke="#2c2839"/>
      <text x="24" y="28" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">TIME →</text>
      <line x1="100" y1="40" x2="600" y2="40" stroke="#2c2839"/>
      <text x="24" y="68" fill="#d4895a" font-size="12" font-family="Cascadia Code,Consolas,monospace">DMA</text>
      <rect x="110" y="52" width="140" height="28" fill="rgba(212,137,90,0.25)" stroke="#d4895a"/>
      <text x="180" y="71" text-anchor="middle" fill="#f0b07a" font-size="12">搬 tile0</text>
      <rect x="260" y="52" width="140" height="28" fill="rgba(212,137,90,0.25)" stroke="#d4895a"/>
      <text x="330" y="71" text-anchor="middle" fill="#f0b07a" font-size="12">搬 tile1</text>
      <rect x="410" y="52" width="140" height="28" fill="rgba(212,137,90,0.25)" stroke="#d4895a"/>
      <text x="480" y="71" text-anchor="middle" fill="#f0b07a" font-size="12">搬 tile2</text>
      <text x="24" y="120" fill="#5bbf9a" font-size="12" font-family="Cascadia Code,Consolas,monospace">MAC</text>
      <rect x="185" y="104" width="140" height="28" fill="rgba(91,191,154,0.2)" stroke="#5bbf9a"/>
      <text x="255" y="123" text-anchor="middle" fill="#5bbf9a" font-size="12">算 tile0</text>
      <rect x="335" y="104" width="140" height="28" fill="rgba(91,191,154,0.2)" stroke="#5bbf9a"/>
      <text x="405" y="123" text-anchor="middle" fill="#5bbf9a" font-size="12">算 tile1</text>
      <line x1="185" y1="80" x2="185" y2="160" stroke="#2c2839" stroke-dasharray="3 3"/>
      <text x="110" y="175" fill="#918aa3" font-size="11">串行：搬完再算 → 利用率掉一半</text>
      <text x="300" y="175" fill="#d4895a" font-size="11">双缓冲：错开半拍，访存藏进计算</text>
    </svg>`,
    "两块 SRAM 轮换。验证切换时刻的同步与别名。"
  );

  V.l09a = wrap(
    "SOFTMAX · e 拉开差距",
    `<svg viewBox="0 0 640 200" class="lv-svg">
      <rect width="640" height="200" fill="#0a0910" stroke="#2c2839"/>
      <text x="24" y="28" fill="#918aa3" font-size="11" font-family="Cascadia Code,Consolas,monospace">s = [1, 2, 1] → exp → normalize</text>
      <rect x="60" y="120" width="48" height="40" fill="rgba(212,137,90,0.3)" stroke="#d4895a"/>
      <text x="84" y="145" text-anchor="middle" fill="#f0b07a" font-size="12">2.7</text>
      <rect x="128" y="70" width="48" height="90" fill="#d4895a"/>
      <text x="152" y="120" text-anchor="middle" fill="#1a1008" font-size="12">7.4</text>
      <rect x="196" y="120" width="48" height="40" fill="rgba(212,137,90,0.3)" stroke="#d4895a"/>
      <text x="220" y="145" text-anchor="middle" fill="#f0b07a" font-size="12">2.7</text>
      <text x="60" y="180" fill="#918aa3" font-size="11">e^s</text>
      <rect x="300" y="70" width="300" height="90" rx="3" fill="#12111a" stroke="#2c2839"/>
      <text x="450" y="105" text-anchor="middle" fill="#5bbf9a" font-size="14">权重 ≈ [0.21, 0.58, 0.21]</text>
      <text x="450" y="130" text-anchor="middle" fill="#918aa3" font-size="12">先减 max 再 exp，防 inf</text>
      <text x="450" y="150" text-anchor="middle" fill="#d4895a" font-size="12" font-family="Cascadia Code,Consolas,monospace">softmax 常在 CPU</text>
    </svg>`,
    "指数负责「拉开」，归一化负责「变成概率」。NPU 主吃 GEMM。"
  );

  /* ── YOLO 全流程 ── */
  V.model = wrap(
    "YOLOv5s DATA PATH",
    `<svg viewBox="0 0 640 120" class="lv-svg">
      <rect width="640" height="120" fill="#0a0910" stroke="#2c2839"/>
      ${[
        ["CAM","1920×1080"],
        ["RGA","640 RGB"],
        ["INT8","quant"],
        ["NPU","3 scales"],
        ["CPU","decode+NMS"]
      ].map((s,i)=>{
        const x=16+i*124;
        const npu=i===3;
        return `<rect x="${x}" y="36" width="112" height="52" rx="3" fill="${npu?"rgba(212,137,90,0.15)":"#12111a"}" stroke="${npu?"#d4895a":"#2c2839"}"/>
        <text x="${x+56}" y="58" text-anchor="middle" fill="${npu?"#f0b07a":"#ede8f5"}" font-size="12">${s[0]}</text>
        <text x="${x+56}" y="76" text-anchor="middle" fill="#918aa3" font-size="10" font-family="Cascadia Code,Consolas,monospace">${s[1]}</text>
        ${i<4?`<path d="M${x+112} 62 H${x+124}" stroke="#d4895a" opacity="0.45"/>`:""}`;
      }).join("")}
    </svg>`,
    "第一个实践从 rknn_model_zoo 抄，不要从零写。仿真对、真机错 → 查驱动/硬件。"
  );

  /* ── 01 线代 ── */
  V.l01b = wrap(
    "DOT PRODUCT · 默契度",
    `<svg viewBox="0 0 640 220" class="lv-svg">
      <rect width="640" height="220" fill="#0a0910" stroke="#2c2839"/>
      <line x1="80" y1="180" x2="600" y2="180" stroke="#2c2839"/>
      <line x1="80" y1="180" x2="80" y2="30" stroke="#2c2839"/>
      <line x1="80" y1="180" x2="280" y2="180" stroke="#d4895a" stroke-width="2"/>
      <line x1="80" y1="180" x2="220" y2="60" stroke="#5bbf9a" stroke-width="2"/>
      <text x="285" y="185" fill="#d4895a" font-size="12" font-family="Cascadia Code,Consolas,monospace">a</text>
      <text x="225" y="55" fill="#5bbf9a" font-size="12" font-family="Cascadia Code,Consolas,monospace">b</text>
      <text x="300" y="80" fill="#918aa3" font-size="12">θ 越小 · cosθ 越大 · 点积越大</text>
      <text x="300" y="110" fill="#f0b07a" font-size="13" font-family="Cascadia Code,Consolas,monospace">a·b = |a||b| cosθ</text>
      <text x="300" y="140" fill="#918aa3" font-size="12">同向 → 大 · 垂直 → 0 · 反向 → 负</text>
    </svg>`,
    "点积衡量方向一致程度。神经元检测特征、注意力算相关度，都是点积。"
  );

  V.l01b2 = wrap(
    "MATRIX × VECTOR · 全连接",
    `<svg viewBox="0 0 640 200" class="lv-svg">
      <rect width="640" height="200" fill="#0a0910" stroke="#2c2839"/>
      <text x="24" y="36" fill="#d4895a" font-size="12" font-family="Cascadia Code,Consolas,monospace">W 4×3</text>
      <text x="200" y="36" fill="#918aa3" font-size="12">×</text>
      <text x="240" y="36" fill="#d4895a" font-size="12" font-family="Cascadia Code,Consolas,monospace">x 3×1</text>
      <text x="360" y="36" fill="#918aa3" font-size="12">=</text>
      <text x="400" y="36" fill="#5bbf9a" font-size="12" font-family="Cascadia Code,Consolas,monospace">y 4×1</text>
      ${[0,1,2,3].map(i=>{
        const y=56+i*32;
        return `<rect x="24" y="${y}" width="160" height="26" fill="${i===1?"rgba(212,137,90,0.15)":"#12111a"}" stroke="${i===1?"#d4895a":"#2c2839"}"/>
        <text x="104" y="${y+18}" text-anchor="middle" fill="#b0b8c8" font-size="12" font-family="Cascadia Code,Consolas,monospace">row${i} · 点积</text>
        <path d="M184 ${y+13} H220" stroke="#2c2839"/>
        <rect x="400" y="${y}" width="80" height="26" fill="${i===1?"rgba(91,191,154,0.15)":"#0e0d16"}" stroke="${i===1?"#5bbf9a":"#2c2839"}"/>
        <text x="440" y="${y+18}" text-anchor="middle" fill="${i===1?"#5bbf9a":"#918aa3"}" font-size="12" font-family="Cascadia Code,Consolas,monospace">y${i}</text>`;
      }).join("")}
      <rect x="240" y="80" width="80" height="80" fill="none" stroke="#d4895a"/>
      <text x="280" y="125" text-anchor="middle" fill="#f0b07a" font-size="14">x</text>
      <text x="500" y="100" fill="#918aa3" font-size="12">外号管结果</text>
      <text x="500" y="120" fill="#918aa3" font-size="12">内号管能否</text>
      <text x="500" y="140" fill="#d4895a" font-size="11" font-family="Cascadia Code,Consolas,monospace">4×3 · 3×1 → 4×1</text>
    </svg>`,
    "W 每一行与 x 点积 → 一个神经元输出。四个点积互不依赖，可全并行 — NPU 阵列的数学根源。"
  );

  V.l01b3 = wrap(
    "REUSE · 数据复用",
    `<svg viewBox="0 0 640 160" class="lv-svg">
      <rect width="640" height="160" fill="#0a0910" stroke="#2c2839"/>
      <text x="24" y="36" fill="#918aa3" font-size="12" font-family="Cascadia Code,Consolas,monospace">W(1024×512) × x(512×1)</text>
      <text x="24" y="70" fill="#f0b07a" font-size="14">MAC 总数 = 1024 × 512 = 524,288</text>
      <text x="24" y="100" fill="#ede8f5" font-size="13">每个权重只用 1 次 · 每个输入用 1024 次</text>
      <text x="24" y="130" fill="#5bbf9a" font-size="13" font-family="Cascadia Code,Consolas,monospace">1 次内存读取换 1024 次乘加 → 片上驻留</text>
    </svg>`,
    "复用率高 → 适合专用硬件。这就是「算力便宜、带宽贵」的另一面。"
  );

  window.LECTURE_VIZ = V;
})();
