/* NPU 互动学习舱 */
(() => {
  "use strict";

  const MODULES = [
    "home", "path", "lectures", "principles", "bitflow", "demo-conv", "demo-pool", "demo-quant",
    "demo-mac", "demo-npu", "demo-attn", "demo-pipe", "model", "quiz", "cards",
    "search", "cheat", "milestones",
  ];

  const PATH = [
    {
      stage: "阶段 0",
      title: "零基础补课",
      desc: "数字与精度、Python/C、Linux/WSL、矩阵、softmax、性能测量。",
      lessons: ["bit/INT8/FP16", "数组与张量 shape", "Linux/SSH/动态库", "均值方差/softmax", "FPS/延迟/能效"],
      milestone: "能读懂 shape，能手算点积和 softmax，能写实验记录模板",
      prereq: "会使用电脑和复制命令即可；完全零基础从这里开始",
      depth: "★ 入门，不需要预先学 AI",
    },
    {
      stage: "阶段一",
      title: "神经网络基础",
      desc: "NPU 要算什么：神经元、激活、全连接、卷积、池化/BN、模型全貌。",
      lessons: ["神经元/MAC", "激活函数", "全连接=矩阵乘", "卷积", "池化与BN", "模型全貌", "线代生存包"],
      milestone: "能手动算出一个小网络的前向传播",
      prereq: "阶段 0；线代可遗忘，1.5 课从直觉重讲；硬件知识有则更快",
      depth: "★ 入门，手算为主",
    },
    {
      stage: "阶段二",
      title: "为何需要 NPU",
      desc: "精度与量化；CPU/GPU/NPU 对比与算力账。",
      lessons: ["FP32→INT8 手算", "scale/零点", "TOPS 账", "四种瓶颈", "系统分工"],
      milestone: "手算一层卷积在 CPU 与 NPU 上各要多久；理解 INT8 推理",
      prereq: "阶段一全部；流水线/SIMD/cache 可查 00-术语表",
      depth: "★★ 概念密，公式要手算",
    },
    {
      stage: "阶段三",
      title: "NPU 硬件架构",
      desc: "MAC 阵列与数据流、存储层次、RKNPU 实例。",
      lessons: ["32×32 阵列", "权重固定/脉动", "im2col", "DDR vs 片上", "运算强度/tiling", "任务列表驱动"],
      milestone: "能画 NPU 框图，讲清 DDR→结果的完整路径",
      prereq: "阶段二（TOPS/量化）；继续用 0.17 GOP 老例子，连续性强",
      depth: "★★★ 账变多，建议对照原理剧场 P3/P6",
    },
    {
      stage: "阶段四",
      title: "软件工具链",
      desc: "训练→ONNX→.rknn 五步；板端 C API 与排查。",
      lessons: ["部署全景", "量化工具", "PC 仿真", "七步 C API", "RGA 预处理", "版本配套"],
      milestone: "理解 .rknn 从何而来、到哪去",
      prereq: "阶段二量化 + 阶段三任务列表/算子回退；会 WSL/Python 更顺，不会则回阶段 0",
      depth: "★★ 流程型，可无板先学",
    },
    {
      stage: "阶段五",
      title: "动手实践",
      desc: "东山派 DshanPi-A1 · RK3576。model zoo → 双核绑核 → W4A16。",
      lessons: ["上手指引", "韦东山教程", "WSL Toolkit2", "core_mask 实验", "IC 验证埋点"],
      milestone: "跑通真实模型并做性能/精度对比",
      prereq: "阶段四；07 第 1 课 Linux 生存包强烈建议先过",
      depth: "★★★ 板端坑多，按上手指引走",
    },
    {
      stage: "并行",
      title: "Linux 与 SoC 补课",
      desc: "MCU→Linux 思维、SoC 内部地图、驱动与设备树。",
      lessons: ["Linux 生存包", "SoC 城市图/IOMMU", "rknpu 驱动拆解"],
      milestone: "讲清摄像头→NPU 出结果各层分工",
      prereq: "MCU/裸机经验即可；按需插入主线，不必顺序学完",
      depth: "★★ 生存向，够用原则",
    },
    {
      stage: "补课",
      title: "数电 · MAC/存储/任务",
      desc: "乘法树、INT32 累加、饱和舍入、双缓冲、任务列表——02/03 的电路底座。",
      lessons: ["乘法器与加法树", "SRAM/DMA/sequencer"],
      milestone: "能用位宽/树深解释 INT8 便宜与溢出验证点",
      prereq: "数电基础；学 02/03 时可并行",
      depth: "★★ 接到验证清单",
    },
    {
      stage: "补课（数学）",
      title: "数学 · 指数/梯度直觉",
      desc: "Softmax 的 e^x、数值稳定、损失与梯度——够用即可，不阻塞推理主线。",
      lessons: ["指数对数 Softmax", "梯度下坡直觉"],
      milestone: "会手算 softmax；能论证推理几乎不用完整高数",
      prereq: "会乘方即可",
      depth: "★ 够用版，刨根可再深挖",
    },
    {
      stage: "阶段六",
      title: "大模型与 Transformer",
      desc: "注意力、位置编码、KV Cache、端侧 LLM 部署。",
      lessons: ["大模型全景", "注意力 QKV", "Transformer 块", "W4A16/稀疏"],
      milestone: "能解释 N² 开销与端侧 LLM 部署要点",
      prereq: "阶段一 CNN 全貌即可并行开；点积/矩阵乘要熟（1.5 课）",
      depth: "★★★ N²/KV Cache 要对照原理剧场 P4",
    },
  ];

  const QUIZ = [
    {
      tag: "数字表示",
      q: "1 byte 最多有多少个不同状态？",
      opts: ["8", "16", "256", "1024"],
      a: 2,
      ex: "1 byte = 8 bit，每个 bit 两种状态，2^8 = 256。",
    },
    {
      tag: "张量 shape",
      q: "[1,3,640,640] 通常表示什么？",
      opts: ["NCHW 图像张量", "一个 640 行的表", "权重矩阵", "FPS 数值"],
      a: 0,
      ex: "N=1 张样本，C=3 通道，H=640，W=640。",
    },
    {
      tag: "量化公式",
      q: "非对称量化中，真实值 x 大约如何由整数 q 恢复？",
      opts: ["x=q+s", "x=q×s", "x=(q-z)×s", "x=q-z"],
      a: 2,
      ex: "zero point z 表示浮点 0 对应的整数位置，所以先减 z 再乘 scale。",
    },
    {
      tag: "requantization",
      q: "INT32 累加结果进入下一层 INT8 之前通常要做什么？",
      opts: ["直接截断后继续", "requantize：缩放、舍入、饱和", "删除 scale", "转成字符串"],
      a: 1,
      ex: "每层激活有自己的 scale，所以要重新缩放到下一层的整数格式。",
    },
    {
      tag: "Linux 排错",
      q: "程序报缺少共享库，第一件事是什么？",
      opts: ["直接换模型", "运行 ldd 看缺少什么", "重新刷板子", "关闭防火墙"],
      a: 1,
      ex: "ldd 可以显示 not found 的动态库，再检查 LD_LIBRARY_PATH/ldconfig。",
    },
    {
      tag: "性能测量",
      q: "为什么纯推理 FPS 不能代表端到端 FPS？",
      opts: ["因为 FPS 不是时间", "因为端到端还包含解码、预处理、后处理和显示", "因为 NPU 不参与", "因为必须用 GPU"],
      a: 1,
      ex: "端到端还包含前后处理和系统调度，必须在测试条件中明确。",
    },
    {
      tag: "NPU load",
      q: "load 为 0 是否可以直接断定模型回退到 CPU？",
      opts: ["是，绝对正确", "不能，还要看采样时机、权限、算子日志和是否正在推理", "是，但只有 RK3576", "不能，因为 load 不存在"],
      a: 1,
      ex: "load 是负载观测值，不等于完整利用率；要结合上下文确认。",
    },
    {
      tag: "卷积 shape",
      q: "无 padding、kernel=3、stride=1 时，输入 8x8 的输出尺寸是多少？",
      opts: ["6x6", "7x7", "8x8", "9x9"],
      a: 0,
      ex: "floor((8-3)/1)+1 = 6。",
    },
    {
      tag: "模型结构",
      q: "神经网络整体是什么结构？",
      opts: [
        "像管道：特征提取（卷积）+ 识别输出（全连接），每层主要=线性变换+激活",
        "只有全连接层堆叠",
        "训练时随机改变结构",
        "必须每个算子都用硬件加速",
      ],
      a: 0,
      ex: "管道式两段结构：卷积提特征，全连接做决策。主要层 = 线性+激活；池化/BN 是辅助工序。",
    },
    {
      tag: "激活函数",
      q: "为什么每层必须有激活？没有会怎样？",
      opts: [
        "输入会变得无意义",
        "多层线性叠加仍是一层线性，表达不了复杂形状",
        "矩阵无法相乘",
        "权重会溢出",
      ],
      a: 1,
      ex: "精确表述：多层无激活的线性层会塌缩成一层线性。激活（如 ReLU）引入弯折，才能逼近任意形状。",
    },
    {
      tag: "权重共享",
      q: "为什么 3×3 卷积核处理再大的图，参数仍然只有 9 个？",
      opts: [
        "因为图被压缩了",
        "因为核就是 3×3 尺寸",
        "同一核全图滑动复用（权重共享），参数不随图变大",
        "因为用了 INT8",
      ],
      a: 2,
      ex: "说对尺寸不够，关键是权重共享。对比全连接 100 万像素会参数爆炸。注意：参数不涨，计算量会随图变大而涨。",
    },
    {
      tag: "池化",
      q: "池化和卷积最大的本质区别是什么？",
      opts: [
        "池化窗口更大",
        "池化没有权重（固定规则），卷积权重是训练学出来的",
        "池化只用于彩色图",
        "卷积不能下采样",
      ],
      a: 1,
      ex: "功能上池化压缩，但硬件上最本质的是：池化无权重 → 纯组合逻辑；卷积有权重 → MAC 阵列。",
    },
    {
      tag: "注意力",
      q: "自注意力里，一个词如何吸收上下文？",
      opts: [
        "Q 和 V 比对相似度后取平均",
        "Q 与各 K 点积得相关度，softmax 成权重，再对各 V 加权平均",
        "随机混合其他词的向量",
        "只看相邻两个词",
      ],
      a: 1,
      ex: "不是「Q 对应 V」：每个 K 带自己的 V，Q 与 K 的相似度决定取多少那个 V。",
    },
    {
      tag: "复杂度",
      q: "上下文从 1000 词涨到 2000 词，相关度计算次数如何变化？",
      opts: [
        "线性翻倍",
        "平方增长：100 万 → 400 万（N²）",
        "指数爆炸",
        "不变",
      ],
      a: 1,
      ex: "N 个词两两相关 = N×N。词翻倍 → 4 倍。这是平方/二次增长，不是指数。",
    },
    {
      tag: "两代模型",
      q: "CNN 和大模型看东西的方式差别是？",
      opts: [
        "都用卷积",
        "CNN 看局部（如 3×3），大模型靠注意力看全局",
        "大模型只看图像",
        "没有差别",
      ],
      a: 1,
      ex: "CNN 核只看邻域，天生看不见远处；注意力每个词能看全句 → 理解长距离指代。",
    },
    {
      tag: "量化",
      q: "对称量化中 scale s 如何计算？误差上界是多少？",
      opts: [
        "s = max|w|/255，误差 ≤ s",
        "s = mean|w|，误差 ≤ 0",
        "s = max|w|/127，误差 ≤ s/2",
        "s = 1，误差 ≤ 127",
      ],
      a: 2,
      ex: "q = round(w/s)，让最大值对准 ±127。格子宽度 s，四舍五入误差不超过半格 s/2。",
    },
    {
      tag: "量化收益",
      q: "INT8 相对 FP32 赚了哪三笔钱？",
      opts: [
        "精度更高、速度更慢、体积更大",
        "计算便宜、搬运便宜、存得便宜",
        "只需训练时间减少",
        "只减少功耗",
      ],
      a: 1,
      ex: "乘法器面积/功耗随位宽平方涨；数据量 1/4 减搬运；权重体积缩 4 倍。",
    },
    {
      tag: "算力单位",
      q: "1 MAC = ? ops；「6 TOPS」意思是？",
      opts: [
        "1 MAC = 1 ops；每秒 6 次运算",
        "1 MAC = 2 ops；每秒 6×10¹² 次运算",
        "1 MAC = 32 ops；每秒 6 GB",
        "1 MAC = 1024 ops；每秒 6 帧",
      ],
      a: 1,
      ex: "1 次乘 + 1 次加 = 2 ops。6 TOPS ≈ 每秒 3 万亿次乘加（30000 亿）。",
    },
    {
      tag: "TOPS 推算",
      q: "RKNPU 单核 1024 INT8 MAC/拍 × 1 GHz，约多少 TOPS？",
      opts: ["0.2 TOPS", "2 TOPS", "20 TOPS", "100 TOPS"],
      a: 1,
      ex: "1024 × 2 ops × 10⁹ ≈ 2.048 TOPS。三核 ≈ 6 TOPS。没有魔法，只有乘法器数量×频率。",
    },
    {
      tag: "系统分工",
      q: "嵌入式 AI 流水线中，NMS / 画框 / 不支持算子通常谁做？",
      opts: ["NPU 固定单元", "RGA", "CPU（运行时自动回退）", "GPU"],
      a: 2,
      ex: "NPU 只跑支持列表内的主力层；预处理可走 RGA；后处理与不支持算子回退 CPU。",
    },
    {
      tag: "部署",
      q: ".rknn 文件的本质是？",
      opts: [
        "通用 ONNX 的另一名字",
        "针对指定芯片编译的任务包（权重+量化参数+任务描述）",
        "训练检查点",
        "Linux 内核模块",
      ],
      a: 1,
      ex: "config 时指定 target_chip，按该芯片算子清单/排布/量化能力生成。RK3588 的 .rknn 不能直接跑 RK3568。",
    },
    {
      tag: "数据流",
      q: "「权重固定」数据流主要省的是谁的跑路？",
      opts: [
        "权重的重复读取（权重住阵列，只载入一次）",
        "输出的写回",
        "指令的取指",
        "时钟树",
      ],
      a: 0,
      ex: "权重最金贵（每个权重要用几万次），权重固定让权重只读一次，输入流过阵列。端侧 NPU 常见。",
    },
  ];

  QUIZ.push(
    {
      tag: "硬件白送",
      q: "为什么说 ReLU / 池化 / BN 在 NPU 硬件里几乎「白送」？",
      opts: [
        "因为它们不需要计算",
        "ReLU=比较器，池化=固定逻辑，BN 推理时折叠进卷积",
        "因为由 CPU 代劳",
        "因为被量化掉了",
      ],
      a: 1,
      ex: "固定功能单元：每种算子一小块专用电路。算子支持列表 = 硬件电路清单。",
    },
    {
      tag: "im2col",
      q: "im2col 的作用是什么？",
      opts: [
        "把图像压缩成 JPEG",
        "把滑动窗口摊平成矩阵，使卷积变成标准 GEMM",
        "加速池化",
        "生成校准数据",
      ],
      a: 1,
      ex: "NPU 实现卷积的通用套路。代价是数据重排/复制——缓冲和 DMA 的日常工作。",
    },
    {
      tag: "救援阶梯",
      q: "量化后精度掉了，优先尝试哪一步？",
      opts: [
        "立刻上 QAT",
        "换更有代表性的校准数据，再 accuracy_analysis 定位层",
        "直接删掉模型后几层",
        "改成 FP32 部署",
      ],
      a: 1,
      ex: "阶梯：换校准数据 → 精度分析 → 混合量化（敏感层 FP16）→ QAT。",
    },
    {
      tag: "CNN vs LLM",
      q: "大模型任务的本质动作是？",
      opts: [
        "图像分类",
        "预测下一个词（聊天是这个动作的循环）",
        "反向传播",
        "权重初始化",
      ],
      a: 1,
      ex: "每生成一个词都要看整个上下文 → 慢、贵。NPU 优化目标包括 N² 注意力与 KV Cache。",
    },
    {
      tag: "训练推理",
      q: "NPU 主要负责哪一类计算？",
      opts: ["训练（反向传播+优化器）", "推理（权重固定，前向 MAC）", "编译器前端", "数据标注"],
      a: 1,
      ex: "浮点训练、整数推理。训练在 GPU/服务器，NPU 只做前向。",
    },
    {
      tag: "卷积直觉",
      q: "关于卷积核，下面哪句正确？",
      opts: [
        "卷积核由人工逐像素设计",
        "卷积核是训练学出来的特征探测器；人设计的是结构",
        "每个输出像素用不同核",
        "卷积核一定等于输入通道数",
      ],
      a: 1,
      ex: "从随机数微调成「竖边探测器」等。人设计：几个核、核多大、叠几层。",
    },
    {
      tag: "CPU 慢因",
      q: "CPU 跑卷积慢的重要原因不包括？",
      opts: [
        "取指译码等指令开销",
        "通用寄存器不够，反复访存",
        "MAC 数量不够且与系统任务抢核",
        "NPU 时钟树更长",
      ],
      a: 3,
      ex: "前三条都是 CPU 慢因。D 说反了：NPU 通路规整，时钟更好做。",
    },
    {
      tag: "利用率",
      q: "真实模型上 NPU 阵列利用率常见区间？",
      opts: ["接近 100%", "30~60%", "5~10%", "100~200%"],
      a: 1,
      ex: "取决于层形状能否喂满 32 的倍数、通道够不够铺满。性能分析要对峰值打折扣。",
    },
    {
      tag: "板卡",
      q: "本学习路线主线板卡是？",
      opts: [
        "RK3588 + Orange Pi",
        "RK3576 + 韦东山东山派 DshanPi-A1",
        "RV1106 + Luckfox",
        "Jetson Orin",
      ],
      a: 1,
      ex: "双核 6TOPS NPU，FP16/W4A16 齐，可覆盖分核绑核、混合量化、LLM 实验。",
    },
    {
      tag: "池化作用",
      q: "池化的主要作用不包括？",
      opts: [
        "下采样减数据量",
        "带来一定平移不变性",
        "学习新的卷积核权重",
        "有助于防过拟合",
      ],
      a: 2,
      ex: "池化无权重，不学习核。Max 保留最显著响应，Average 更平滑。",
    },
    {
      tag: "线性塌缩",
      q: "为什么每层之间必须有非线性激活？",
      opts: [
        "否则矩阵无法相乘",
        "多层线性复合仍等价一层线性，表达力塌缩",
        "为了减少参数量",
        "为了方便量化",
      ],
      a: 1,
      ex: "y=b(ax) 仍是直线。ReLU 引入铰链，多个铰链才能逼近复杂边界。",
    },
    {
      tag: "im2col",
      q: "im2col 的代价是什么？",
      opts: [
        "参数量翻倍",
        "必须改用浮点",
        "数据重排/复制，增加缓冲与 DMA 工作",
        "无法在 NPU 上运行",
      ],
      a: 2,
      ex: "换来了标准 GEMM 形状；重排由片上缓冲和 DMA 包办，是编译器排布工作的一部分。",
    },
    {
      tag: "运算强度",
      q: "运算强度低（如 depthwise）时，NPU 更容易卡在哪？",
      opts: ["指令取指", "DDR 带宽（搬运）", "时钟树", "寄存器重命名"],
      a: 1,
      ex: "每字节配的运算太少 → 搬运时间超过计算时间。融合/片上复用是在抬有效强度。",
    },
    {
      tag: "BN 折叠",
      q: "推理阶段 BN 如何「消失」在硬件里？",
      opts: [
        "被直接丢弃",
        "γ/σ 与 β−γμ/σ 折进卷积权重和偏置",
        "改由 GPU 执行",
        "量化成 INT4",
      ],
      a: 1,
      ex: "推理时 BN 参数是常数，可并入前一层线性变换，硬件只需 Conv+ReLU。",
    },
    {
      tag: "全流程",
      q: "第一个板端实践最稳妥的起点是？",
      opts: [
        "自己从零训练再部署",
        "从 rknn_model_zoo 抄转换脚本 + 官方 C demo",
        "直接手写 NPU 寄存器",
        "只用 CPU 跑 OpenCV",
      ],
      a: 1,
      ex: "zoo 自带 convert、板端 demo、FPS 基准。流程跑通后再改自己的模型。",
    },
    {
      tag: "全流程",
      q: "load 显示 0% 时，正确做法是？",
      opts: [
        "直接断定 NPU 坏了",
        "结合采样时机、权限、算子日志和 dmesg 一起查",
        "立刻重启",
        "换一块板子",
      ],
      a: 1,
      ex: "0% 只是瞬时观测值，不能单独作为回退/未加载的证据；先确认正在推理、debugfs 权限、采样时机，再看算子回退与 dmesg。",
    },
    {
      tag: "全流程",
      q: "1920×1080 → 640×640 预处理谁做最合适？",
      opts: ["NPU", "RGA 硬件", "GPU 3D", "必须手工 memcpy"],
      a: 1,
      ex: "RGA（本板 2×RGA2-Pro）一拍 resize/色转；配合 dma-buf 零拷贝给 NPU。",
    },
  );

  const FLASH = [
    { q: "1 byte = ? bit？", a: "8 bit；2^8 = 256 个状态。" },
    { q: "NCHW 是什么顺序？", a: "Batch、Channel、Height、Width。" },
    { q: "非对称量化反量化公式？", a: "x ≈ (q - zero_point) × scale。" },
    { q: "requantization 做什么？", a: "把 INT32 累加结果缩放、舍入、饱和成下一层格式。" },
    { q: "缺共享库先执行什么？", a: "ldd ./程序，看 not found。" },
    { q: "纯推理 FPS 和端到端 FPS 差在哪？", a: "端到端还包含解码、预处理、后处理、显示和调度。" },
    { q: "神经网络推理 = ?", a: "一堆矩阵乘法 + 非线性映射。NPU 只做推理（权重固定）。" },
    { q: "一个神经元在硬件上是什么？", a: "一次 MAC：y = w·x + b（乘累加）。" },
    { q: "矩阵乘法唯一规则？", a: "左行 × 右列，对应相乘再相加。口诀：外号管结果，内号管能否。" },
    { q: "卷积输出尺寸公式？", a: "(原图 − 核) / 步长 + 1（无填充时）。" },
    { q: "权重共享解决什么问题？", a: "大图参数爆炸。参数只随核大小定，不随图像变大；计算量仍会涨。" },
    { q: "池化和卷积最本质区别？", a: "池化无权重；卷积权重是训练学出来的。" },
    { q: "对称量化公式？", a: "s = max|w|/127，q = round(w/s)，x̂ = q·s，误差 ≤ s/2。" },
    { q: "对称 vs 非对称？", a: "对称管「两边晃」的权重；非对称管「一边倒」的激活（多零点 z）。" },
    { q: "INT8 三笔钱？", a: "计算便宜（乘法器位宽²）、搬运便宜（1/4）、存得便宜（模型缩 4 倍）。" },
    { q: "1 MAC = ? ops；TOPS 定义？", a: "1 MAC = 2 ops；1 TOPS = 10¹² ops/s。" },
    { q: "RKNPU 单核 2 TOPS 从哪来？", a: "1024 INT8 MAC/拍 × ~1 GHz × 2 ops ≈ 2 TOPS。" },
    { q: "NPU 核心五件套？", a: "MAC 阵列 + 片上缓冲 + DMA + 固定功能单元 + 任务控制器。" },
    { q: "ReLU 硬件是什么？", a: "比较器+选择器，几乎白送。BN 推理折叠进卷积，无独立 BN 单元。" },
    { q: "im2col 做什么？", a: "滑窗摊平成矩阵，卷积→GEMM，喂 MAC 阵列。代价是数据重排。" },
    { q: "数据流选择的本质？", a: "决定「谁少跑路」。权重固定/输出固定/行固定/脉动各有取舍。" },
    { q: "脉动阵列优点？", a: "数据只传邻居，互连短 → 高频省电；填充/排空有延迟，适合大矩阵。" },
    { q: "部署五步？", a: "训练 → ONNX → .rknn（量化）→ 推板 → 运行时推理。" },
    { q: ".rknn 能跨芯片吗？", a: "不能。绑定 target_platform 的算子清单/排布/量化能力，换芯片要重转。" },
    { q: "NPU 不包打天下，谁伺候？", a: "预处理 RGA/CPU；主力层 NPU；NMS/业务/不支持算子 CPU。" },
    { q: "注意力四步？", a: "Q·K 点积相关度 → softmax 权重 → 对 V 加权平均 → 每词并行。" },
    { q: "上下文 1000→2000，算力？", a: "N² 平方：100 万→400 万次。是平方不是指数。" },
    { q: "CNN vs 大模型？", a: "CNN 看局部；大模型注意力看全局 → 懂长距离指代。" },
    { q: "量化精度救援阶梯？", a: "换校准数据 → accuracy_analysis → 混合量化 FP16 → QAT。" },
    { q: "RK3576 NPU 要点？", a: "双核 6T（稀疏口径）、FP16/W4A16、rknpu 驱动≥0.9.8、rknn-llm v1.3.0。" },
    { q: "点积几何含义？", a: "|a||b|cosθ：方向一致最大，垂直 0，反向为负。MAC=点积。" },
    { q: "im2col 是什么？", a: "每个滑窗复制成矩阵一行，卷积→GEMM。代价是数据重排。" },
    { q: "运算强度？", a: "ops/byte。低于屋脊线（算力/带宽）则搬运成墙。" },
    { q: "BN 推理折叠？", a: "把 γ/σ、β−γμ/σ 并进卷积 W、b，硬件无独立 BN 单元。" },
    { q: "YOLO 部署第一站？", a: "rknn_model_zoo：convert.py + C demo + FPS 表，不要从零写。" },
    { q: "load=0%？", a: "不能直接断定为 CPU 回退；先查采样时机/权限/算子日志/dmesg。" },
    { q: "预处理谁做？", a: "RGA 硬件 resize/色转；零拷贝传 fd 给 NPU，CPU 别硬扛。" },
  ];

  const NPU_PARTS = {
    buf: {
      title: "权重 / 激活缓冲",
      body: `<p>片上 SRAM，靠近 MAC 阵列。权重一次载入反复复用；激活按 tiling 分块驻留。</p>
             <p>NPU 设计灵魂之一：<strong>让数据少跑 DDR</strong>。运算强度高（每字节多次 MAC）时阵列才能喂满。</p>`,
    },
    mac: {
      title: "MAC 阵列",
      body: `<p>1024 个 INT8 MAC/拍 × 1 GHz × 2 ops ≈ <strong>2 TOPS</strong>（RK3588 单核量级）。</p>
             <p>卷积循环被摊开成空间：权重/输入在缓冲复用，部分和沿行累加。真实利用率 30~60%。</p>
             <p>32×32：通道数是否凑满 32 的倍数，直接影响喂满程度。</p>`,
    },
    acc: {
      title: "累加器组",
      body: `<p>INT32 累加：多次 INT8 乘积相加不溢出。验证要关注饱和行为与累加链一致性。</p>
             <p>软件黄金模型与硬件必须逐 bit 一致，否则精度对不上。</p>`,
    },
    act: {
      title: "激活单元",
      body: `<p>ReLU：z>0 取 z，否则取 0。硬件 = 比较器 + 选择器，几乎白送。</p>
             <p>没有激活，多层线性仍是线性——网络表达力塌缩。</p>`,
    },
    pool: {
      title: "池化单元",
      body: `<p>Max / Average，无权重、固定规则 → 纯组合逻辑。</p>
             <p>输出尺寸公式与卷积相同。作用：降维、平移不变、防过拟合。</p>`,
    },
    dq: {
      title: "量化 / 反量化",
      body: `<p>乘 scale s + 舍入。每层甚至每通道的 s 是编译时算好的常数。</p>
             <p>配置通路传错一层，全图悄悄错——验证重点。</p>`,
    },
    dma: {
      title: "DMA",
      body: `<p>包办 DDR ↔ 片上缓冲搬运。与计算流水重叠（double buffering）以隐藏延迟。</p>
             <p>「NPU 瓶颈一半在搬运」——零拷贝、合适排布（NC1HWC2）都是为了少搬、搬得整齐。</p>`,
    },
    ctrl: {
      title: "任务控制器",
      body: `<p>逐条执行「任务列表」：每层的量化参数、tiling、DMA 描述符、算子类型。</p>
             <p>.rknn 就是编译好的任务包。验证要覆盖任务切换、填充排空、异常打断后状态干净。</p>`,
    },
  };

  const DF_HINTS = {
    ws: "权重只读一次，复用率最高——每个权重要被用几万次。部分和要在阵列间流动，互连压力大。端侧 NPU 常见。",
    os: "每个 MAC（或每行）负责固定输出的完整累加，部分和不出阵列；代价是权重和输入要反复广播/搬运。",
    rs: "MIT Eyeriss 行固定：按行切卷积，三类数据都有复用，总能耗学术上最优，控制最复杂。",
    sys: "脉动阵列（TPU 经典）：数据只传给相邻 MAC，一拍一拍「泵血」。互连极短，适合大矩阵；填充/排空有延迟。",
  };

  const PIPE = [
    {
      title: "1 · 训练",
      body: `<p>在服务器用 PyTorch / TensorFlow 训练<strong>浮点</strong>模型，得到 .pt / SavedModel。</p>
             <p>NPU 不参与训练。训练 = 调权重；推理 = 权重固定只前向。</p>`,
    },
    {
      title: "2 · 导出 ONNX",
      body: `<p>把框架模型导出为 ONNX——「模型界的 ELF」，训练框架与芯片解耦。</p>
             <p>类比 IC：RTL 各家写，综合工具吃统一网表。</p>`,
    },
    {
      title: "3 · 转 .rknn（Toolkit2）",
      body: `<p>PC 端 RKNN-Toolkit2（v2.3.x）五步：</p>
             <pre>rknn.config(target_platform='rk3576')
rknn.load_onnx('yolo.onnx')
rknn.build(do_quantization=True, dataset='./calib.txt')
rknn.export_rknn('yolo_rk3576.rknn')
rknn.init_runtime()  # PC 仿真可选</pre>
             <p><code>build()</code> 内部做 PTQ：用校准集统计每层范围、定 scale、生成任务描述。</p>
             <p>Windows 装 Linux wheel 走 WSL。<code>target_platform</code> 换芯片只改这一处字符串。</p>`,
    },
    {
      title: "4 · 推到板端",
      body: `<p>adb push 或 scp 拷贝 <code>.rknn</code> 到 DshanPi-A1。</p>
             <p>注意驱动版本：RK3576 跑 rknn-llm 需要 rknpu 驱动 ≥ 0.9.8。ArmbianOS 自带 rknpu，且 ≠ armbian.com 社区镜像。</p>`,
    },
    {
      title: "5 · 板端推理",
      body: `<p>librknnrt.so（C API）或 rknn-toolkit-lite2（Python）加载模型，走 NPU 推理。</p>
             <p>七步 C API：init → query → io_num → inputs_set → run → outputs_get → release。</p>
             <p>排查三件套：看驱动版本、看算子是否回退 CPU、看 <code>/sys/kernel/debug/rknpu/load</code> 占用。</p>`,
    },
  ];

  /* ---------- utils ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 1800);
  }

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem("npu-learn-progress") || "{}");
    } catch {
      return {};
    }
  }
  function saveProgress(p) {
    localStorage.setItem("npu-learn-progress", JSON.stringify(p));
  }

  function updateProgressUI() {
    const p = loadProgress();
    const total = lectList.length || 0;
    const read = new Set(p._lectRead || []);
    const readN = total ? lectList.filter((l) => read.has(l.id)).length : 0;
    const pct = total ? Math.round((readN / total) * 100) : 0;
    const selfN = MODULES.filter((m) => p[m]).length;
    const pctEl = $("#progress-pct");
    if (pctEl) pctEl.textContent = pct + "%";
    const fill = $("#progress-fill");
    if (fill) fill.style.width = pct + "%";
    const meta = $("#progress-meta");
    if (meta) {
      meta.textContent = total
        ? `已读 ${readN}/${total} 篇 · 自评 ${selfN}/${MODULES.length}`
        : "讲义未加载";
    }
    $$(".mark-btn").forEach((btn) => {
      const m = btn.dataset.module;
      if (!btn.dataset.label) btn.dataset.label = btn.textContent.trim();
      btn.classList.toggle("done", !!p[m]);
      btn.textContent = p[m] ? "已掌握 ✓" : btn.dataset.label;
    });
    syncPathProgress();
  }

  /* ---------- theme ---------- */
  function applyTheme(t) {
    if (t === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = t;
    try { localStorage.setItem("npu-theme", t); } catch { /* 忽略 */ }
    const btn = $("#theme-toggle");
    if (btn) btn.textContent = t === "dark" ? "☾" : "☀";
  }
  function initTheme() {
    applyCanvasPalette();
    const btn = $("#theme-toggle");
    if (btn) {
      applyTheme(localStorage.getItem("npu-theme") || "light");
      btn.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
        applyTheme(next);
        applyCanvasPalette();
        drawDot(); drawLinear(); drawSoftmax(); drawQbins(); drawRace();
      });
    }
  }

  /* ---------- navigation & hash routing ---------- */
  let booted = false;
  let applyingRoute = false;

  function loadMeta() {
    try {
      return JSON.parse(localStorage.getItem("npu-learn-meta") || "{}");
    } catch {
      return {};
    }
  }
  function saveMeta(patch) {
    try {
      localStorage.setItem("npu-learn-meta", JSON.stringify({ ...loadMeta(), ...patch }));
    } catch { /* 隐私模式下忽略 */ }
  }
  function currentViewName() {
    const active = $(".view.active");
    return active ? active.id.replace(/^view-/, "") : "home";
  }
  function lastLectureIndex() {
    const id = loadMeta().lastLecture;
    if (!id) return -1;
    return lectList.findIndex((l) => l.id === id);
  }
  function routeFor(name) {
    if (name === "lectures" && lectList[lectIdx]) return "#/lectures/" + lectList[lectIdx].id;
    return "#/" + name;
  }
  function writeHash(name) {
    if (!booted || applyingRoute) return;
    const target = routeFor(name);
    if (location.hash === target) return;
    location.hash = target;
  }
  function showView(name, opts = {}) {
    const view = $("#view-" + name);
    if (!view) return;
    $$(".view").forEach((v) => v.classList.remove("active"));
    $$(".nav-item").forEach((n) => {
      const on = n.dataset.view === name;
      n.classList.toggle("active", on);
      if (on) n.setAttribute("aria-current", "page");
      else n.removeAttribute("aria-current");
    });
    view.classList.add("active");
    $("#main").scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.body.classList.remove("nav-open");
    const toggle = $("#nav-toggle");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (!opts.silent) {
      saveMeta({ lastView: name });
      writeHash(name);
    }
  }
  function applyRoute() {
    if (applyingRoute) return;
    applyingRoute = true;
    try {
      const raw = (location.hash || "").replace(/^#\/?/, "");
      const parts = raw.split("/");
      const known = parts[0] && $("#view-" + parts[0]) ? parts[0] : "";
      const name = known || loadMeta().lastView || "home";
      const here = currentViewName();
      const sameLect = name !== "lectures" || (lectList[lectIdx] && lectList[lectIdx].id === parts[1]);
      if (here === name && sameLect) return;
      showView(name, { silent: true });
      if (name === "lectures") {
        let idx = parts[1] ? lectList.findIndex((l) => l.id === parts[1]) : -1;
        if (idx < 0) idx = lastLectureIndex();
        openLecture(idx >= 0 ? idx : 0, { silent: true });
      }
    } finally {
      applyingRoute = false;
    }
  }

  $$(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });
  $("#nav-toggle")?.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    $("#nav-toggle").setAttribute("aria-expanded", open ? "true" : "false");
  });

  $("#resume-go")?.addEventListener("click", () => {
    const i = lastLectureIndex();
    showView("lectures");
    openLecture(i >= 0 ? i : 0);
  });
  $("#resume-start")?.addEventListener("click", () => {
    showView("lectures");
    openLecture(0);
  });

  $$("[data-go]").forEach((el) => {
    el.addEventListener("click", () => showView(el.dataset.go));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showView(el.dataset.go);
      }
    });
  });

  $$(".mark-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = loadProgress();
      const m = btn.dataset.module;
      p[m] = !p[m];
      saveProgress(p);
      updateProgressUI();
      toast(p[m] ? "已标记掌握" : "已取消标记");
    });
  });

  $("#reset-progress").addEventListener("click", () => {
    if (confirm("确定清空全部学习进度？")) {
      localStorage.removeItem("npu-learn-progress");
      localStorage.removeItem("npu-quiz-state");
      localStorage.removeItem("npu-learn-meta");
      updateProgressUI();
      initQuiz(true);
      toast("进度已重置");
    }
  });

  /* ---------- path ---------- */
  function renderPath() {
    const host = $("#path-list");
    host.innerHTML = PATH.map(
      (s) => `
      <article class="path-card">
        <div class="path-stage">${s.stage}</div>
        <div>
          <h3>${s.title}</h3>
          <p>${s.desc}</p>
          <div class="path-lessons">${s.lessons.map((l) => `<span>${l}</span>`).join("")}</div>
          <p class="path-prereq"><b>前提</b> ${s.prereq}</p>
          <p class="path-prereq"><b>密度</b> ${s.depth}</p>
          <div class="path-milestone">MILESTONE · ${s.milestone}</div>
          <div class="path-prog" data-prog-stage="${s.stage}">
            <span class="pp-text micro">已读 0/0 篇</span>
            <div class="bar"><i style="width:0%"></i></div>
          </div>
          <div class="controls" style="margin-top:12px">
            <button class="secondary-btn" data-open-lect-stage="${s.stage}">打开本阶段讲义</button>
          </div>
        </div>
      </article>`
    ).join("");

    $$("[data-open-lect-stage]").forEach((btn) => {
      btn.addEventListener("click", () => {
        showView("lectures");
        openFirstLectureOfStage(btn.dataset.openLectStage);
      });
    });
    syncPathProgress();
  }

  /* ---------- convolution ---------- */
  const convImg = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const convKer = [1, 2, 3, 4];
  const convWins = [
    [0, 1, 3, 4],
    [1, 2, 4, 5],
    [3, 4, 6, 7],
    [4, 5, 7, 8],
  ];
  const convOut = [37, 47, 67, 77];
  let convStep = 0;
  let convTimer = null;

  function renderConv() {
    const inputEl = $("#conv-input");
    const kerEl = $("#conv-kernel");
    const outEl = $("#conv-output");
    const win = convWins[convStep];

    inputEl.innerHTML = convImg
      .map((v, i) => `<div class="cell${win.includes(i) ? " active" : ""}">${v}</div>`)
      .join("");
    kerEl.innerHTML = convKer.map((v) => `<div class="cell kernel">${v}</div>`).join("");
    outEl.innerHTML = convOut
      .map((v, i) =>
        i < convStep
          ? `<div class="cell out filled">${v}</div>`
          : i === convStep
            ? `<div class="cell out filled" style="box-shadow:0 0 12px rgba(91,191,154,.35)">${v}</div>`
            : `<div class="cell out">?</div>`
      )
      .join("");

    const parts = win.map((idx, j) => `${convImg[idx]}×${convKer[j]}`);
    $("#conv-formula").textContent = `${parts.join(" + ")} = ${convOut[convStep]}`;
    $("#conv-step-label").textContent = `窗口 ${convStep + 1} / 4`;
  }

  $("#conv-prev")?.addEventListener("click", () => {
    convStep = (convStep + 3) % 4;
    stopConvPlay();
    renderConv();
  });
  $("#conv-next")?.addEventListener("click", () => {
    convStep = (convStep + 1) % 4;
    stopConvPlay();
    renderConv();
  });
  $("#conv-play")?.addEventListener("click", () => {
    if (convTimer) {
      stopConvPlay();
      return;
    }
    $("#conv-play").textContent = "⏸ 暂停";
    convTimer = setInterval(() => {
      convStep = (convStep + 1) % 4;
      renderConv();
    }, 900);
  });
  function stopConvPlay() {
    if (convTimer) clearInterval(convTimer);
    convTimer = null;
    const b = $("#conv-play");
    if (b) b.textContent = "▶ 播放";
  }

  /* ---------- pooling ---------- */
  const poolIn = [1, 3, 2, 4, 5, 6, 8, 7, 9, 0, 1, 2, 3, 4, 5, 6];
  const poolWins = [
    [0, 1, 4, 5],
    [2, 3, 6, 7],
    [8, 9, 12, 13],
    [10, 11, 14, 15],
  ];
  const poolMaxOut = [6, 8, 9, 6];
  const poolAvgOut = [3.75, 5.25, 4.0, 3.5];
  let poolMode = "max";
  let poolStep = 0;

  function renderPool() {
    const win = poolWins[poolStep];
    const maxVal = Math.max(...win.map((i) => poolIn[i]));
    const avg =
      win.reduce((s, i) => s + poolIn[i], 0) / 4;

    $("#pool-input").innerHTML = poolIn
      .map((v, i) => {
        let cls = "cell";
        if (win.includes(i)) cls += " pool-sel";
        if (poolMode === "max" && i === win.find((j) => poolIn[j] === maxVal)) cls += " pool-max";
        return `<div class="${cls}" data-pidx="${i}">${v}</div>`;
      })
      .join("");

    const outs = poolMode === "max" ? poolMaxOut : poolAvgOut;
    $("#pool-output").innerHTML = outs
      .map((v, i) =>
        i <= poolStep
          ? `<div class="cell out filled">${poolMode === "avg" && v % 1 !== 0 ? v.toFixed(2) : v}</div>`
          : `<div class="cell out">?</div>`
      )
      .join("");

    const vals = win.map((i) => poolIn[i]);
    $("#pool-formula").textContent =
      poolMode === "max"
        ? `窗口${poolStep + 1} → [${vals.join(" ")}] → max = ${maxVal}`
        : `窗口${poolStep + 1} → (${vals.join("+")})/4 = ${avg.toFixed(2)}`;

    // click cells to jump windows
    $$("#pool-input .cell").forEach((cell) => {
      cell.addEventListener("click", () => {
        const idx = +cell.dataset.pidx;
        const w = poolWins.findIndex((arr) => arr.includes(idx));
        if (w >= 0) {
          poolStep = w;
          renderPool();
        }
      });
    });
  }

  $$(".pool-mode").forEach((btn) => {
    btn.addEventListener("click", () => {
      poolMode = btn.dataset.mode;
      $$(".pool-mode").forEach((b) => b.classList.toggle("active", b === btn));
      renderPool();
    });
  });

  /* ---------- quantization ---------- */
  function renderQuant() {
    const ws = [0, 1, 2, 3].map((i) => parseFloat($("#qw" + i).value));
    if (ws.some((w) => Number.isNaN(w))) return;
    const maxAbs = Math.max(...ws.map(Math.abs));
    const s = maxAbs / 127;
    const half = s / 2;

    $("#q-max").textContent = maxAbs.toFixed(4);
    $("#q-s").textContent = s.toFixed(5);
    $("#q-half").textContent = half.toFixed(5);

    const tbody = $("#quant-table tbody");
    tbody.innerHTML = ws
      .map((w) => {
        const raw = w / s;
        const q = Math.round(raw);
        const qClamped = Math.max(-128, Math.min(127, q));
        const deq = qClamped * s;
        const err = deq - w;
        const ok = Math.abs(err) <= half + 1e-9;
        return `<tr>
          <td>${w.toFixed(2)}</td>
          <td>${raw.toFixed(2)}</td>
          <td>${qClamped}</td>
          <td>${deq.toFixed(4)}</td>
          <td class="${ok ? "err-ok" : "err-bad"}">${err >= 0 ? "+" : ""}${err.toFixed(4)}</td>
        </tr>`;
      })
      .join("");
  }
  [0, 1, 2, 3].forEach((i) => $("#qw" + i)?.addEventListener("input", renderQuant));

  /* ---------- MAC calculator ---------- */
  function fmtNum(n) {
    if (!isFinite(n)) return "—";
    if (n >= 1e9) return (n / 1e9).toFixed(2) + " G";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + " M";
    if (n >= 1e3) return (n / 1e3).toFixed(2) + " K";
    if (n >= 1) return n.toFixed(2);
    if (n >= 0.001) return (n * 1000).toFixed(2) + " m";
    return (n * 1e6).toFixed(2) + " µ";
  }

  function calcMac() {
    const hw = +$("#s-hw").value;
    const co = +$("#s-co").value;
    const k = +$("#s-k").value;
    const ci = +$("#s-ci").value;
    const tops = +$("#s-tops").value;
    const util = +$("#s-util").value / 100;

    $("#v-hw").textContent = hw;
    $("#v-co").textContent = co;
    $("#v-k").textContent = k;
    $("#v-ci").textContent = ci;
    $("#v-tops").textContent = tops.toFixed(1);
    $("#v-util").textContent = Math.round(util * 100);

    // same pad out = in
    const macs = hw * hw * co * k * k * ci;
    const ops = macs * 2;
    const gop = ops / 1e9;
    $("#m-mac").textContent = fmtNum(macs);
    $("#m-ops").textContent = fmtNum(ops);
    $("#m-gop").textContent = gop.toFixed(3) + " GOP";
    $("#mac-formula").textContent = `MAC = (${hw}×${hw}) × ${co} × (${k}×${k}×${ci}) = ${macs.toLocaleString()}`;

    // CPU: 32 MAC/cycle @ 2GHz = 64 GMAC/s = 0.128 TOPS
    const cpuTops = 0.128;
    const tCpu = ops / (cpuTops * 1e12);
    const tCpuReal = tCpu * 5;
    const tNpu = ops / (tops * 1e12);
    const tNpuReal = tNpu / util;

    const fmtTime = (t) => {
      if (t >= 1) return t.toFixed(2) + " s";
      if (t >= 0.001) return (t * 1000).toFixed(2) + " ms";
      return (t * 1e6).toFixed(1) + " µs";
    };
    $("#t-cpu").textContent = fmtTime(tCpu);
    $("#t-cpu-real").textContent = fmtTime(tCpuReal);
    $("#t-npu").textContent = fmtTime(tNpu);
    $("#t-npu-real").textContent = fmtTime(tNpuReal);

    const maxT = Math.max(tCpuReal, tNpuReal, 1e-9);
    const bars = [
      { label: "CPU 实际", t: tCpuReal, cls: "cpu" },
      { label: "NPU 利用后", t: tNpuReal, cls: "npu" },
    ];
    $("#time-chart").innerHTML = bars
      .map(
        (b) => `
      <div class="bar-row">
        <div class="bar-label">${b.label}</div>
        <div class="bar-track"><div class="bar-fill ${b.cls}" style="width:${Math.max(2, (b.t / maxT) * 100)}%"></div></div>
        <div class="bar-val">${fmtTime(b.t)}</div>
      </div>`
      )
      .join("");
  }

  ["s-hw", "s-co", "s-k", "s-ci", "s-tops", "s-util"].forEach((id) =>
    $("#" + id)?.addEventListener("input", calcMac)
  );

  /* ---------- NPU diagram ---------- */
  $$(".npu-block").forEach((block) => {
    block.addEventListener("click", () => {
      $$(".npu-block").forEach((b) => b.classList.remove("selected"));
      block.classList.add("selected");
      const part = block.dataset.part;
      const info = NPU_PARTS[part];
      if (!info) return;
      $("#npu-detail-title").textContent = info.title;
      $("#npu-detail-body").innerHTML = info.body;
    });
  });

  $$(".df-card").forEach((card) => {
    card.addEventListener("click", () => {
      $$(".df-card").forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      $("#df-hint").textContent = DF_HINTS[card.dataset.df] || "";
    });
  });

  /* ---------- attention ---------- */
  const words = [
    { t: "我", v: [1, 0] },
    { t: "爱", v: [1, 1] },
    { t: "猫", v: [0, 1] },
  ];
  const attnQ = 1; // 爱
  let attnStep = 0;

  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }
  function softmax(arr) {
    const max = Math.max(...arr);
    const exps = arr.map((x) => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => e / sum);
  }

  function attnScores() {
    const q = words[attnQ].v;
    return words.map((w) => dot(q, w.v));
  }

  function renderAttn() {
    const scores = attnScores();
    const weights = softmax(scores);
    $("#attn-words").innerHTML = words
      .map((w, i) => {
        let extra = "";
        if (attnStep >= 3) extra = `<span class="vec">权重 ${weights[i].toFixed(2)}</span>`;
        else if (attnStep >= 1) extra = `<span class="vec">点积 ${scores[i]}</span>`;
        else extra = `<span class="vec">[${w.v.join(", ")}]</span>`;
        return `<div class="attn-word${i === attnQ ? " active" : ""}" data-aw="${i}">
          <span>${w.t}${i === attnQ ? " (Q)" : ""}</span>${extra}
        </div>`;
      })
      .join("");

    // matrix: if step>=2 show weights row highlighted; else scores
    let cells = [];
    let label = "相关度 Q·Kᵀ（只展示「爱」所在行）";
    if (attnStep === 0) {
      cells = words.map((w) => ({
        v: "·",
        cls: "",
      }));
      label = "准备：选择 Query 词「爱」";
    } else {
      cells = scores.map((s, i) => {
        let cls = "heat-low";
        if (attnStep >= 2) {
          const wt = weights[i];
          cls = wt > 0.45 ? "heat-high" : wt > 0.25 ? "heat-mid" : "heat-low";
          return { v: wt.toFixed(2), cls };
        }
        if (s >= 2) cls = "heat-high";
        else if (s >= 1) cls = "heat-mid";
        return { v: s.toString(), cls };
      });
      if (attnStep >= 2) label = "Softmax 权重（加起来 = 1）";
    }
    $("#attn-matrix-label").textContent = label;
    $("#attn-matrix").innerHTML = cells
      .map((c) => `<div class="cell ${c.cls}">${c.v}</div>`)
      .join("");

    if (attnStep >= 3) {
      const out = [0, 0];
      words.forEach((w, i) => {
        out[0] += weights[i] * w.v[0];
        out[1] += weights[i] * w.v[1];
      });
      $("#attn-vector").textContent = `[${out[0].toFixed(2)}, ${out[1].toFixed(2)}]`;
    } else if (attnStep === 0) {
      $("#attn-vector").textContent = "[1, 1]";
    } else {
      $("#attn-vector").textContent = "…";
    }

    const msgs = [
      "「爱」= [1,1] 作为 Query，去看句中每个词。",
      "相关度(爱,我)=1，(爱,爱)=2，(爱,猫)=1。点积 = 默契度。",
      "Softmax → 权重约 [0.21, 0.58, 0.21]，自己权重最高。",
      "加权平均 V：0.21×[1,0]+0.58×[1,1]+0.21×[0,1] ≈ [0.79, 0.79]。上下文已混入。",
      "每个词都做一遍且可并行 → 本质是矩阵乘法，NPU 最喜欢的形状。",
    ];
    $("#attn-formula").textContent = msgs[attnStep];
    $("#attn-step-label").textContent = `第 ${attnStep} 步 / 4`;
  }

  $("#attn-next")?.addEventListener("click", () => {
    attnStep = Math.min(4, attnStep + 1);
    renderAttn();
  });
  $("#attn-prev")?.addEventListener("click", () => {
    attnStep = Math.max(0, attnStep - 1);
    renderAttn();
  });
  $("#attn-reset")?.addEventListener("click", () => {
    attnStep = 0;
    renderAttn();
  });

  function calcN2() {
    const n = +$("#s-nctx").value;
    $("#v-nctx").textContent = n;
    const n2 = n * n;
    $("#m-n2").textContent = n2.toLocaleString();
    $("#m-n2-rel").textContent = (n2 / 1e6).toFixed(2) + "×";
    const cases = [1000, 2000, 4000];
    const max = 4000 * 4000;
    $("#n2-chart").innerHTML = cases
      .map((c) => {
        const v = c * c;
        return `<div class="bar-row">
          <div class="bar-label">${c} 词</div>
          <div class="bar-track"><div class="bar-fill" style="width:${(v / max) * 100}%"></div></div>
          <div class="bar-val">${v.toLocaleString()}</div>
        </div>`;
      })
      .join("");
  }
  $("#s-nctx")?.addEventListener("input", calcN2);

  /* ---------- pipeline ---------- */
  function renderPipe(idx) {
    $$(".pipe-step").forEach((s, i) => s.classList.toggle("active", i === idx));
    const p = PIPE[idx];
    $("#pipe-detail-title").textContent = p.title;
    $("#pipe-detail-body").innerHTML = p.body;
  }
  $$(".pipe-step").forEach((btn) => {
    btn.addEventListener("click", () => renderPipe(+btn.dataset.step));
  });

  /* ---------- quiz ---------- */
  let quizState = { answered: {}, score: 0 };

  function saveQuiz() {
    localStorage.setItem("npu-quiz-state", JSON.stringify(quizState));
  }
  function loadQuiz() {
    try {
      const s = JSON.parse(localStorage.getItem("npu-quiz-state") || "null");
      if (s && s.answered) quizState = s;
    } catch {
      /* ignore */
    }
  }

  function initQuiz(reset) {
    if (reset) quizState = { answered: {}, score: 0 };
    loadQuiz();
    const host = $("#quiz-list");
    host.innerHTML = QUIZ.map((item, i) => {
      const ans = quizState.answered[i];
      const opts = item.opts
        .map((t, j) => {
          let cls = "quiz-opt";
          if (ans != null) {
            if (j === item.a) cls += " correct";
            else if (j === ans) cls += " wrong";
          }
          return `<button class="${cls}" data-q="${i}" data-o="${j}" ${ans != null ? "disabled" : ""}>${t}</button>`;
        })
        .join("");
      return `<article class="quiz-card" data-card="${i}">
        <span class="quiz-tag">#${i + 1} ${item.tag}</span>
        <div class="quiz-q">${item.q}</div>
        <div class="quiz-opts">${opts}</div>
        <div class="quiz-explain${ans != null ? " show" : ""}" id="ex-${i}">${item.ex}</div>
      </article>`;
    }).join("");

    $$(".quiz-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qi = +btn.dataset.q;
        const oi = +btn.dataset.o;
        if (quizState.answered[qi] != null) return;
        quizState.answered[qi] = oi;
        if (oi === QUIZ[qi].a) {
          quizState.score += 1;
          toast("正确");
        } else {
          toast("不对，看解析");
        }
        saveQuiz();
        initQuiz(false);
      });
    });

    updateQuizScore();
    applyQuizFilter();
  }

  function updateQuizScore() {
    const total = QUIZ.length;
    const answered = Object.keys(quizState.answered).length;
    $("#quiz-score").textContent = quizState.score;
    $("#quiz-total").textContent = total;
    $("#quiz-acc").textContent = answered ? `已答 ${answered} 题` : "";
  }

  let quizFilter = "all";
  function applyQuizFilter() {
    $$(".quiz-card").forEach((card) => {
      const i = +card.dataset.card;
      if (quizFilter === "wrong") {
        const ans = quizState.answered[i];
        card.classList.toggle("hidden", ans == null || ans === QUIZ[i].a);
      } else {
        card.classList.remove("hidden");
      }
    });
  }

  $("#quiz-restart")?.addEventListener("click", () => {
    quizState = { answered: {}, score: 0 };
    saveQuiz();
    initQuiz(true);
    toast("题库已重置");
  });
  $("#quiz-filter-all")?.addEventListener("click", () => {
    quizFilter = "all";
    applyQuizFilter();
  });
  $("#quiz-filter-wrong")?.addEventListener("click", () => {
    quizFilter = "wrong";
    applyQuizFilter();
  });

  /* ---------- flashcards ---------- */
  let flashDeck = FLASH.map((_, i) => i);
  let flashIdx = 0;
  const flashSeen = new Set();

  function renderFlash() {
    const card = FLASH[flashDeck[flashIdx]];
    $("#flash-front").textContent = card.q;
    $("#flash-back").textContent = card.a;
    $("#flash-inner").classList.remove("flipped");
    $("#flash-count").textContent = `${flashIdx + 1} / ${flashDeck.length}`;
    flashSeen.add(flashDeck[flashIdx]);
    $("#flash-dots").innerHTML = flashDeck
      .map(
        (id, i) =>
          `<button class="flash-dot${i === flashIdx ? " active" : ""}${flashSeen.has(id) && i !== flashIdx ? " seen" : ""}" data-di="${i}"></button>`
      )
      .join("");
    $$(".flash-dot").forEach((d) =>
      d.addEventListener("click", () => {
        flashIdx = +d.dataset.di;
        renderFlash();
      })
    );
  }

  function flipFlash() {
    $("#flash-inner").classList.toggle("flipped");
  }
  $("#flashcard")?.addEventListener("click", flipFlash);
  $("#flash-flip")?.addEventListener("click", flipFlash);
  $("#flash-next")?.addEventListener("click", () => {
    flashIdx = (flashIdx + 1) % flashDeck.length;
    renderFlash();
  });
  $("#flash-prev")?.addEventListener("click", () => {
    flashIdx = (flashIdx - 1 + flashDeck.length) % flashDeck.length;
    renderFlash();
  });
  $("#flash-shuffle")?.addEventListener("click", () => {
    for (let i = flashDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flashDeck[i], flashDeck[j]] = [flashDeck[j], flashDeck[i]];
    }
    flashIdx = 0;
    renderFlash();
    toast("已洗牌");
  });

  document.addEventListener("keydown", (e) => {
    if (!$("#view-cards")?.classList.contains("active")) return;
    if (e.code === "Space") {
      e.preventDefault();
      flipFlash();
    }
    if (e.code === "ArrowRight") {
      flashIdx = (flashIdx + 1) % flashDeck.length;
      renderFlash();
    }
    if (e.code === "ArrowLeft") {
      flashIdx = (flashIdx - 1 + flashDeck.length) % flashDeck.length;
      renderFlash();
    }
  });

  /* ---------- Principle theater ---------- */
  let COPPER, COPPER_HI, OK, ALUM, MUTED, LINE, INK, COPPER_RGB, FLUX;
  function applyCanvasPalette() {
    const g = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    COPPER = g("--copper");
    COPPER_HI = g("--copper-hi");
    OK = g("--ok");
    ALUM = g("--alum");
    MUTED = g("--muted");
    LINE = g("--line");
    INK = g("--ink");
    COPPER_RGB = g("--copper-rgb");
    FLUX = g("--flux");
  }

  function setupCanvas(cv) {
    if (!cv) return null;
    const w = +cv.getAttribute("width") || 420;
    const h = +cv.getAttribute("height") || 280;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    cv.style.width = w + "px";
    cv.style.height = h + "px";
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  function drawArrow(ctx, x0, y0, x1, y1, color) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    const ang = Math.atan2(y1 - y0, x1 - x0);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - 10 * Math.cos(ang - 0.4), y1 - 10 * Math.sin(ang - 0.4));
    ctx.lineTo(x1 - 10 * Math.cos(ang + 0.4), y1 - 10 * Math.sin(ang + 0.4));
    ctx.closePath();
    ctx.fill();
  }

  /* P1 dot product */
  let dotSetup = null;
  function drawDot() {
    const theta = +$("#s-dot-theta").value * (Math.PI / 180);
    $("#v-dot-theta").textContent = $("#s-dot-theta").value + "°";
    if (!dotSetup) return;
    const { ctx, w, h } = dotSetup;
    ctx.clearRect(0, 0, w, h);
    const ox = w * 0.28;
    const oy = h * 0.72;
    const scale = 70;

    // grid
    ctx.strokeStyle = `rgba(${COPPER_RGB}, 0.22)`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(20 + i * 40, 10);
      ctx.lineTo(20 + i * 40, h - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(10, 20 + i * 35);
      ctx.lineTo(w - 10, 20 + i * 35);
      ctx.stroke();
    }

    const ax = 2.2, ay = 0;
    const bx = 2.2 * Math.cos(theta), by = -2.2 * Math.sin(theta);
    drawArrow(ctx, ox, oy, ox + ax * scale, oy + ay * scale, COPPER);
    drawArrow(ctx, ox, oy, ox + bx * scale, oy + by * scale, OK);

    // projection of b onto a
    const proj = 2.2 * Math.cos(theta);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = `rgba(${COPPER_RGB}, 0.45)`;
    ctx.beginPath();
    ctx.moveTo(ox + bx * scale, oy + by * scale);
    ctx.lineTo(ox + proj * scale, oy);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = "12px Cascadia Code, Consolas, monospace";
    ctx.fillStyle = COPPER_HI;
    ctx.fillText("a", ox + ax * scale - 8, oy + 18);
    ctx.fillStyle = OK;
    ctx.fillText("b", ox + bx * scale + 6, oy + by * scale);
    ctx.fillStyle = MUTED;
    ctx.fillText("投影 = |b|cosθ", ox + proj * scale * 0.5, oy - 8);

    const dotVal = 2.2 * 2.2 * Math.cos(theta);
    $("#m-dot-val").textContent = dotVal.toFixed(2);
    $("#m-dot-cos").textContent = Math.cos(theta).toFixed(3);
  }
  $("#s-dot-theta")?.addEventListener("input", drawDot);

  /* P2 linear collapse */
  let linMode = "linear";
  let linSetup = null;
  function drawLinear() {
    const a = +$("#s-lin-a").value / 10;
    const b = +$("#s-lin-b").value / 10;
    $("#v-lin-a").textContent = a.toFixed(1);
    $("#v-lin-b").textContent = b.toFixed(1);
    if (!linSetup) return;
    const { ctx, w, h } = linSetup;
    ctx.clearRect(0, 0, w, h);
    const ox = w / 2;
    const oy = h / 2;
    const sc = 40;

    ctx.strokeStyle = LINE;
    ctx.beginPath();
    ctx.moveTo(10, oy);
    ctx.lineTo(w - 10, oy);
    ctx.moveTo(ox, 10);
    ctx.lineTo(ox, h - 10);
    ctx.stroke();

    const plot = (fn, color, width) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      let first = true;
      for (let px = 15; px < w - 15; px++) {
        const x = (px - ox) / sc;
        const y = fn(x);
        const py = oy - y * sc;
        if (py < 5 || py > h - 5) {
          first = true;
          continue;
        }
        if (first) {
          ctx.moveTo(px, py);
          first = false;
        } else ctx.lineTo(px, py);
      }
      ctx.stroke();
    };

    // ghost single linear with ab
    plot((x) => a * b * x, "rgba(176,184,200,0.25)", 1.5);

    if (linMode === "linear") {
      plot((x) => a * x, "rgba(212,137,90,0.35)", 1.5);
      plot((x) => b * (a * x), COPPER_HI, 2);
      $("#lin-readout").textContent = `y = ${(a * b).toFixed(2)} x  ← 仍是一条直线（灰=等效单层）`;
    } else {
      plot((x) => Math.max(0, a * x), "rgba(212,137,90,0.4)", 1.5);
      plot((x) => b * Math.max(0, a * x), OK, 2.2);
      $("#lin-readout").textContent = `y = ${b.toFixed(2)}·ReLU(${a.toFixed(2)}x)  ← 中间出现铰链`;
    }

    ctx.font = "11px Cascadia Code, Consolas, monospace";
    ctx.fillStyle = MUTED;
    ctx.fillText("x", w - 18, oy - 8);
    ctx.fillText("y", ox + 8, 18);
  }
  $("#s-lin-a")?.addEventListener("input", drawLinear);
  $("#s-lin-b")?.addEventListener("input", drawLinear);
  $("#lin-mode-linear")?.addEventListener("click", () => {
    linMode = "linear";
    $("#lin-mode-linear").classList.add("active");
    $("#lin-mode-relu").classList.remove("active");
    drawLinear();
  });
  $("#lin-mode-relu")?.addEventListener("click", () => {
    linMode = "relu";
    $("#lin-mode-relu").classList.add("active");
    $("#lin-mode-linear").classList.remove("active");
    drawLinear();
  });

  /* P3 im2col */
  const imImg = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const imKer = [1, 2, 3, 4];
  const imWins = [
    [0, 1, 3, 4],
    [1, 2, 4, 5],
    [3, 4, 6, 7],
    [4, 5, 7, 8],
  ];
  const imOut = [37, 47, 67, 77];
  let imStep = 0;
  let imTimer = null;

  function renderIm2col() {
    const win = imWins[imStep];
    $("#im2col-img").innerHTML = imImg
      .map((v, i) => `<div class="cell${win.includes(i) ? " active" : ""}">${v}</div>`)
      .join("");
    $("#im2col-table").innerHTML = imWins
      .map((arr, ri) =>
        arr
          .map(
            (idx, ci) =>
              `<div class="ic-cell${ri === imStep ? " row-hi" : ""}">${imImg[idx]}</div>`
          )
          .join("") +
        `<div class="ic-cell empty">·</div>`.repeat(0)
      )
      .join("");
    // show kernel column as 5th? keep 4 cols only; add kernel row note in out
    $("#im2col-out").innerHTML = imOut
      .map((v, i) =>
        i < imStep
          ? `<div class="cell out filled">${v}</div>`
          : i === imStep
            ? `<div class="cell out filled">${v}</div>`
            : `<div class="cell out">?</div>`
      )
      .join("");
    $("#im2col-step").textContent = `窗口 ${imStep + 1} / 4 · 行 ${imStep + 1} · × [${imKer.join(",")}] = ${imOut[imStep]}`;
  }
  $("#im2col-next")?.addEventListener("click", () => {
    imStep = (imStep + 1) % 4;
    stopIm2col();
    renderIm2col();
  });
  $("#im2col-play")?.addEventListener("click", () => {
    if (imTimer) {
      stopIm2col();
      return;
    }
    $("#im2col-play").textContent = "⏸ 暂停";
    imTimer = setInterval(() => {
      imStep = (imStep + 1) % 4;
      renderIm2col();
    }, 1000);
  });
  function stopIm2col() {
    if (imTimer) clearInterval(imTimer);
    imTimer = null;
    const b = $("#im2col-play");
    if (b) b.textContent = "▶ 演示";
  }

  /* P4 softmax */
  let smSetup = null;
  function drawSoftmax() {
    const s1 = +$("#s-sm-s1").value;
    const T = +$("#s-sm-t").value / 100;
    const scores = [1, s1, 1];
    const labels = ["我", "爱", "猫"];
    const scaled = scores.map((s) => s / T);
    const max = Math.max(...scaled);
    const exps = scaled.map((s) => Math.exp(s - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    const w = exps.map((e) => e / sum);

    $("#v-sm-s1").textContent = s1;
    $("#v-sm-t").textContent = T.toFixed(2);
    $("#sm-readout").textContent = `w = [${w.map((x) => x.toFixed(2)).join(", ")}]  Σ=1`;

    if (!smSetup) return;
    const { ctx, w: cw, h: ch } = smSetup;
    ctx.clearRect(0, 0, cw, ch);
    const base = ch - 36;
    const maxH = ch - 70;
    const bw = 48;
    const gap = 36;
    const total = labels.length * bw + (labels.length - 1) * gap;
    const x0 = (cw - total) / 2;

    labels.forEach((lab, i) => {
      const hh = Math.max(4, w[i] * maxH);
      const x = x0 + i * (bw + gap);
      const y = base - hh;
      ctx.fillStyle = i === 1 ? COPPER : `rgba(${COPPER_RGB}, 0.35)`;
      ctx.fillRect(x, y, bw, hh);
      ctx.fillStyle = INK;
      ctx.font = "13px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(lab, x + bw / 2, base + 20);
      ctx.fillStyle = COPPER_HI;
      ctx.font = "11px Cascadia Code, Consolas, monospace";
      ctx.fillText(w[i].toFixed(2), x + bw / 2, y - 8);
      ctx.fillStyle = MUTED;
      ctx.fillText(`s=${scores[i]}`, x + bw / 2, base + 34);
    });
    ctx.textAlign = "left";
  }
  $("#s-sm-s1")?.addEventListener("input", drawSoftmax);
  $("#s-sm-t")?.addEventListener("input", drawSoftmax);

  /* P5 quant bins */
  let qbSetup = null;
  function drawQbins() {
    const wRaw = +$("#s-qb-w").value / 100;
    const max = +$("#s-qb-max").value / 100;
    const s = max / 127;
    const q = Math.round(wRaw / s);
    const qClamped = Math.max(-128, Math.min(127, q));
    const deq = qClamped * s;
    const err = deq - wRaw;

    $("#v-qb-w").textContent = wRaw.toFixed(2);
    $("#v-qb-max").textContent = max.toFixed(2);
    $("#m-qb-s").textContent = s.toFixed(5);
    $("#m-qb-q").textContent = `${qClamped} → ${deq.toFixed(3)}`;
    $("#m-qb-e").textContent = (err >= 0 ? "+" : "") + err.toFixed(4);
    $("#m-qb-e").style.color = Math.abs(err) <= s / 2 + 1e-9 ? OK : FLUX;

    if (!qbSetup) return;
    const { ctx, w: cw, h: ch } = qbSetup;
    ctx.clearRect(0, 0, cw, ch);
    const y = ch / 2;
    const pad = 30;
    const span = cw - pad * 2;
    const xOf = (v) => pad + ((v + max) / (2 * max)) * span;

    // continuum
    const grad = ctx.createLinearGradient(pad, 0, cw - pad, 0);
    grad.addColorStop(0, `rgba(${COPPER_RGB}, 0.12)`);
    grad.addColorStop(0.5, `rgba(${COPPER_RGB}, 0.35)`);
    grad.addColorStop(1, `rgba(${COPPER_RGB}, 0.12)`);
    ctx.fillStyle = grad;
    ctx.fillRect(pad, y - 10, span, 20);

    // bins (sample every 8 for readability)
    ctx.strokeStyle = LINE;
    for (let i = -128; i <= 127; i += 8) {
      const x = xOf(i * s);
      ctx.beginPath();
      ctx.moveTo(x, y - 16);
      ctx.lineTo(x, y + 16);
      ctx.stroke();
    }
    ctx.strokeStyle = COPPER;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(cw - pad, y);
    ctx.stroke();

    // float point
    const xf = xOf(wRaw);
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(xf, y - 28, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "11px Cascadia Code, Consolas, monospace";
    ctx.fillStyle = INK;
    ctx.fillText("w", xf - 4, y - 38);

    // quantized
    const xq = xOf(deq);
    ctx.fillStyle = OK;
    ctx.beginPath();
    ctx.arc(xq, y + 28, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = OK;
    ctx.fillText("q×s", xq - 12, y + 48);

    // error bracket
    ctx.strokeStyle = Math.abs(err) <= s / 2 + 1e-9 ? OK : FLUX;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(xf, y - 20);
    ctx.lineTo(xq, y + 20);
    ctx.stroke();

    ctx.fillStyle = MUTED;
    ctx.fillText(`−max ${(-max).toFixed(2)}`, pad, y + 62);
    ctx.fillText(`+max ${max.toFixed(2)}`, cw - pad - 50, y + 62);
  }
  $("#s-qb-w")?.addEventListener("input", drawQbins);
  $("#s-qb-max")?.addEventListener("input", drawQbins);

  /* P6 race */
  function drawRace() {
    const ai = +$("#s-race-ai").value; // ops/byte
    const mb = +$("#s-race-bytes").value;
    $("#v-race-ai").textContent = ai;
    $("#v-race-bytes").textContent = mb.toFixed(1);

    const ops = ai * mb * 1e6;
    const bytes = mb * 1e6;
    const tComp = ops / (2e12); // 2 TOPS
    const tMove = bytes / (34e9); // 34 GB/s
    const fmt = (t) =>
      t >= 0.001 ? (t * 1000).toFixed(2) + " ms" : (t * 1e6).toFixed(1) + " µs";
    $("#race-comp-t").textContent = fmt(tComp);
    $("#race-move-t").textContent = fmt(tMove);
    const maxT = Math.max(tComp, tMove, 1e-12);
    $("#race-comp").style.width = Math.max(3, (tComp / maxT) * 100) + "%";
    $("#race-move").style.width = Math.max(3, (tMove / maxT) * 100) + "%";
    const wall = tMove > tComp ? "带宽墙（搬运）" : "算力墙（计算）";
    const ridge = 2e12 / 34e9;
    $("#race-verdict").textContent = `瓶颈：${wall} · 当前强度 ${ai} ops/B · 屋脊线 ≈ ${ridge.toFixed(0)} ops/B`;
  }
  $("#s-race-ai")?.addEventListener("input", drawRace);
  $("#s-race-bytes")?.addEventListener("input", drawRace);

  function initPrinciples() {
    dotSetup = setupCanvas($("#cv-dot"));
    linSetup = setupCanvas($("#cv-linear"));
    smSetup = setupCanvas($("#cv-softmax"));
    qbSetup = setupCanvas($("#cv-qbins"));
    drawDot();
    drawLinear();
    renderIm2col();
    drawSoftmax();
    drawQbins();
    drawRace();
  }

  /* ---------- Bit-level data path ---------- */
  function toBits(n, width) {
    const v = ((n % (1 << width)) + (1 << width)) % (1 << width);
    return v.toString(2).padStart(width, "0").split("");
  }
  function bitsToHtml(bits, opts = {}) {
    const cls = (b, i) => {
      let c = "bit";
      if (b === "1") c += " one";
      if (opts.signBit && i === 0) c += " sign";
      if (opts.hotSet && opts.hotSet.has(i)) c += " hot";
      return c;
    };
    return bits.map((b, i) => `<span class="${cls(b, i)}">${b}</span>`).join("");
  }

  let bfStage = -1;
  let bfTimer = null;

  function bfVals() {
    const x = Math.max(-128, Math.min(127, parseInt($("#bf-x").value, 10) || 0));
    const w = Math.max(-128, Math.min(127, parseInt($("#bf-w").value, 10) || 0));
    const acc0 = parseInt($("#bf-acc0").value, 10) || 0;
    const s = parseFloat($("#bf-s").value) || 0.01;
    return { x, w, acc0, s };
  }

  function renderBitflow() {
    if (!$("#bp-ddr")) return;
    const { x, w, acc0, s } = bfVals();
    const xb = toBits(x, 8);
    const wb = toBits(w, 8);
    const prod = x * w;
    const acc = acc0 + prod;
    const y = acc * s;
    const q = Math.max(-128, Math.min(127, Math.round(y)));
    const zero = "00000000".split("");

    $("#bp-ddr").innerHTML = bitsToHtml(xb, { signBit: true });
    $("#bp-ddr-v").textContent = `x=${x}`;
    $("#bp-buf").innerHTML = bfStage >= 1 ? bitsToHtml(xb, { signBit: true }) : bitsToHtml(zero);
    $("#bp-buf-v").textContent = bfStage >= 1 ? `驻留 ${x}` : "—";
    $("#bp-mac-x").innerHTML =
      bfStage >= 2 ? bitsToHtml(xb, { signBit: true, hotSet: new Set([1, 2, 3]) }) : bitsToHtml(zero);
    $("#bp-mac-w").innerHTML =
      bfStage >= 2 ? bitsToHtml(wb, { signBit: true, hotSet: new Set([0, 2]) }) : bitsToHtml(zero);
    $("#bp-mac-v").textContent = bfStage >= 2 ? `${x}×${w}=${prod}` : "等待";
    $("#bp-acc").textContent = bfStage >= 3 ? String(acc) : "0";
    $("#bp-acc-v").textContent = bfStage >= 3 ? "INT32" : "Σ";
    $("#bp-scale").textContent = bfStage >= 4 ? y.toFixed(4) : "—";
    $("#bp-scale-v").textContent = bfStage >= 4 ? `× ${s}` : "反量化";
    $("#bp-out").innerHTML = bfStage >= 5 ? bitsToHtml(toBits(q, 8), { signBit: true }) : bitsToHtml(zero);
    $("#bp-out-v").textContent = bfStage >= 5 ? `q=${q}` : "—";

    $$(".bp-node").forEach((n) => n.classList.toggle("active", +n.dataset.st === bfStage));
    $$(".bp-wire").forEach((wire) => {
      wire.classList.toggle("active", +wire.dataset.st === bfStage && bfStage < 5);
    });
    $("#bf-stage-label").textContent = `阶段 ${Math.max(0, bfStage + 1)} / 6`;

    const grid = (el, noteEl, bits, val) => {
      const weights = [-128, 64, 32, 16, 8, 4, 2, 1];
      el.innerHTML = bits
        .map((b, i) => {
          const on = b === "1";
          const sign = i === 0;
          return `<div class="bit-cell${on ? " on" : ""}${sign ? " sign" : ""}"><span class="bw">${weights[i]}</span>${b}</div>`;
        })
        .join("");
      noteEl.textContent = `补码 · MSB=−128 · 十进制 ${val}`;
    };
    grid($("#bit-grid-x"), $("#bit-grid-x-note"), xb, x);
    grid($("#bit-grid-w"), $("#bit-grid-w-note"), wb, w);

    const msgs = [
      `DDR 读入 x=${x}（补码 ${xb.join("")}）`,
      `驻留片上缓冲，权重可反复复用，少跑 DDR`,
      `MAC：${x}×${w}=${prod}，乘法器只吃 8bit`,
      `INT32 累加：${acc0}+(${prod})=${acc}`,
      `反量化 y≈acc×s=${y.toFixed(4)}`,
      `舍入/饱和到 INT8：q=${q}`,
    ];
    $("#bf-readout").textContent = bfStage < 0 ? "点「播放」看每一个 bit 怎么走。" : msgs[Math.max(0, bfStage)];
  }

  function bfStep() {
    bfStage = bfStage >= 5 ? 0 : bfStage + 1;
    renderBitflow();
  }
  function bfStopPlay() {
    if (bfTimer) clearInterval(bfTimer);
    bfTimer = null;
    const b = $("#bf-play");
    if (b) b.textContent = "▶ 播放";
  }
  $("#bf-step")?.addEventListener("click", () => {
    bfStopPlay();
    bfStep();
  });
  $("#bf-reset")?.addEventListener("click", () => {
    bfStopPlay();
    bfStage = -1;
    renderBitflow();
  });
  $("#bf-play")?.addEventListener("click", () => {
    if (bfTimer) {
      bfStopPlay();
      return;
    }
    $("#bf-play").textContent = "⏸ 暂停";
    bfTimer = setInterval(() => {
      if (bfStage >= 5) {
        bfStopPlay();
        return;
      }
      bfStep();
    }, 900);
  });
  ["bf-x", "bf-w", "bf-acc0", "bf-s"].forEach((id) =>
    $("#" + id)?.addEventListener("input", () => {
      bfStopPlay();
      if (bfStage < 0) bfStage = 0;
      renderBitflow();
    })
  );

  /* ---------- Lecture reader ---------- */
  const lectList = Array.isArray(window.LECTURES) ? window.LECTURES : [];
  const DEMO_LABELS = {
    "demo-conv": "卷积手算",
    "demo-pool": "池化演示",
    "demo-quant": "量化实验室",
    "demo-mac": "算力对比",
    "demo-npu": "NPU 内部",
    "demo-attn": "注意力",
    "demo-pipe": "部署链路",
    model: "YOLO 全流程",
    principles: "原理剧场",
    bitflow: "位级数据流",
    path: "学习路线",
    quiz: "自测题库",
    cards: "闪卡",
  };
  let lectIdx = 0;

  function lectReadSet() {
    return new Set(loadProgress()._lectRead || []);
  }
  function markLectRead(id) {
    const p = loadProgress();
    const set = new Set(p._lectRead || []);
    set.add(id);
    p._lectRead = [...set];
    saveProgress(p);
    // also count lectures module when many read
    if (set.size >= lectList.length) p.lectures = true;
    saveProgress(p);
    updateProgressUI();
    renderResume();
  }

  function unmarkLectRead(id) {
    const p = loadProgress();
    p._lectRead = (p._lectRead || []).filter((x) => x !== id);
    if (p._lectRead.length < lectList.length) p.lectures = false;
    saveProgress(p);
    updateProgressUI();
    renderResume();
  }

  function renderResume() {
    const bar = $("#resume-bar");
    if (!bar) return;
    const i = lastLectureIndex();
    const title = $("#resume-title");
    const go = $("#resume-go");
    const start = $("#resume-start");
    const kicker = $(".resume-copy .micro");
    if (i >= 0 && lectList[i]) {
      if (kicker) kicker.textContent = "CONTINUE · 继续上次";
      if (title) title.textContent = `第 ${i + 1} / ${lectList.length} 篇 · ${lectList[i].title}`;
      if (go) go.textContent = "继续阅读";
      if (start) start.hidden = false;
    } else {
      const first = lectList[0];
      if (kicker) kicker.textContent = "START HERE · 从这里开始";
      if (title) title.textContent = first ? `第 1 篇 · ${first.title}` : "按顺序从第一篇读起";
      if (go) go.textContent = "开始学习";
      if (start) start.hidden = true;
    }
    bar.hidden = false;
  }

  function renderLectIndex() {
    const host = $("#lect-index");
    if (!host) return;
    if (!lectList.length) {
      host.innerHTML = '<div class="hint" style="padding:12px">未找到 lectures.js，请确认与 index.html 同目录。</div>';
      return;
    }
    const read = lectReadSet();
    const groups = {};
    lectList.forEach((L, i) => {
      if (!groups[L.stage]) groups[L.stage] = [];
      groups[L.stage].push({ L, i });
    });
    host.innerHTML = Object.keys(groups)
      .map((stage) => {
        const items = groups[stage]
          .map(
            ({ L, i }) => `
          <button class="lect-item${i === lectIdx ? " active" : ""}${read.has(L.id) ? " read" : ""}" data-lect="${i}">
            <span class="done-dot"></span>
            <span>${L.title}</span>
          </button>`
          )
          .join("");
        const inStage = groups[stage];
        const doneInStage = inStage.filter(({ L }) => read.has(L.id)).length;
        return `<div class="lect-group"><div class="micro">${stage}<span class="lg-count">${doneInStage}/${inStage.length}</span></div></div>${items}`;
      })
      .join("");
    $$(".lect-item", host).forEach((btn) => {
      btn.addEventListener("click", () => openLecture(+btn.dataset.lect));
    });
  }

  function lectureVizHtml(id) {
    const viz = window.LECTURE_VIZ || {};
    const keys = Object.keys(viz).filter((k) => k === id || k.startsWith(id));
    // also map extra keys like l01a2
    const extras = Object.keys(viz).filter((k) => k.startsWith(id) && k !== id);
    const all = [];
    if (viz[id]) all.push(viz[id]);
    extras.sort().forEach((k) => {
      if (!all.includes(viz[k])) all.push(viz[k]);
    });
    if (!all.length) return "";
    return `<div class="lect-viz-gallery">${all.join("")}</div>`;
  }

  function openLecture(i, opts = {}) {
    if (!lectList.length) return;
    lectIdx = Math.max(0, Math.min(lectList.length - 1, i));
    const L = lectList[lectIdx];
    const read = lectReadSet();
    $("#lect-stage").textContent = L.stage;
    $("#lect-title").textContent = L.title;
    $("#lect-file").textContent = L.file;
    const viz = lectureVizHtml(L.id);
    $("#lect-body").innerHTML =
      (viz ? viz + '<div class="lect-viz-sep micro">正文</div>' : "") +
      (L.html || '<p class="hint">（空）</p>');
    const demos = $("#lect-demos");
    demos.innerHTML = (L.demos || [])
      .map((d) => `<button class="lect-demo-chip" data-go="${d}">↔ ${DEMO_LABELS[d] || d}</button>`)
      .join("");
    $$("[data-go]", demos).forEach((b) =>
      b.addEventListener("click", () => showView(b.dataset.go))
    );
    const markBtn = $("#lect-mark");
    markBtn.textContent = read.has(L.id) ? "已读 ✓" : "标记已读";
    markBtn.classList.toggle("done", read.has(L.id));
    renderLectIndex();
    const main = $(".lect-main");
    if (main) main.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });
    bindLectureLiveConv();
    if (!opts.silent) {
      saveMeta({ lastLecture: L.id, lastView: "lectures" });
      writeHash("lectures");
      renderResume();
    }
  }

  function bindLectureLiveConv() {
    const inEl = $("#lv-conv-in");
    if (!inEl) return;
    const img = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const ker = [1, 2, 3, 4];
    const wins = [
      [0, 1, 3, 4],
      [1, 2, 4, 5],
      [3, 4, 6, 7],
      [4, 5, 7, 8],
    ];
    const outs = [37, 47, 67, 77];
    let step = 0;
    const paint = () => {
      const win = wins[step];
      inEl.innerHTML = img
        .map((v, i) => `<div class="cell${win.includes(i) ? " active" : ""}">${v}</div>`)
        .join("");
      const kEl = $("#lv-conv-k");
      if (kEl) kEl.innerHTML = ker.map((v) => `<div class="cell kernel">${v}</div>`).join("");
      const oEl = $("#lv-conv-out");
      if (oEl) {
        oEl.innerHTML = outs
          .map((v, i) => {
            let cls = "cell out";
            if (i <= step) cls += " filled";
            if (i === step) cls += " active";
            return `<div class="${cls}" data-w="${i}" style="cursor:pointer">${i <= step ? v : "?"}</div>`;
          })
          .join("");
        $$("[data-w]", oEl).forEach((cell) => {
          cell.addEventListener("click", () => {
            step = +cell.dataset.w;
            paint();
          });
        });
      }
      const f = $("#lv-conv-formula");
      if (f) {
        const parts = win.map((idx, j) => `${img[idx]}×${ker[j]}`);
        f.textContent = `${parts.join(" + ")} = ${outs[step]}`;
      }
    };
    paint();
  }

  const STAGE_TO_LECT = {
    "阶段 0": "00-零基础",
    "补课（数学）": "09-数学补课",
    阶段一: "01-神经网络基础",
    阶段二: "02-为何需要NPU",
    阶段三: "03-NPU硬件架构",
    阶段四: "04-软件工具链",
    阶段五: "05-实践",
    并行: "07-Linux与SoC补课",
    补课: "08-数电补课",
    阶段六: "06-大模型与Transformer",
  };

  function stageCounts(stageName) {
    const target = STAGE_TO_LECT[stageName] || stageName;
    const list = lectList.filter((L) => L.stage === target);
    const read = new Set(loadProgress()._lectRead || []);
    return { total: list.length, read: list.filter((L) => read.has(L.id)).length };
  }

  function syncPathProgress() {
    $$(".path-prog").forEach((box) => {
      const { read, total } = stageCounts(box.dataset.progStage);
      const label = $(".pp-text", box);
      const bar = $(".bar i", box);
      if (label) label.textContent = total ? `已读 ${read}/${total} 篇` : "无讲义";
      if (bar) bar.style.width = total ? Math.round((read / total) * 100) + "%" : "0%";
    });
  }

  function openFirstLectureOfStage(stageKey) {
    // stage in PATH is 阶段一 etc; lectures use 01-神经网络基础
    const target = STAGE_TO_LECT[stageKey] || stageKey;
    const i = lectList.findIndex((L) => L.stage === target);
    openLecture(i >= 0 ? i : 0);
  }

  function lectDelta(d) {
    openLecture(lectIdx + d);
  }
  $("#lect-prev")?.addEventListener("click", () => lectDelta(-1));
  $("#lect-next")?.addEventListener("click", () => lectDelta(1));
  $("#lect-prev-b")?.addEventListener("click", () => lectDelta(-1));
  $("#lect-next-b")?.addEventListener("click", () => lectDelta(1));
  document.addEventListener("keydown", (e) => {
    if (!$("#view-lectures")?.classList.contains("active")) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      lectDelta(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      lectDelta(-1);
    }
  });
  $("#lect-mark")?.addEventListener("click", () => {
    const L = lectList[lectIdx];
    if (!L) return;
    if (lectReadSet().has(L.id)) {
      unmarkLectRead(L.id);
      openLecture(lectIdx, { silent: true });
      toast("已取消已读");
    } else {
      markLectRead(L.id);
      openLecture(lectIdx, { silent: true });
      toast("已标记已读");
    }
  });

  /* ---------- Full model: YOLOv5s ---------- */
  const MODEL_STEPS = [
    {
      title: "00 · 模型卡",
      where: "认知",
      body: `
        <p>选一个<strong>官方 model zoo 有现成转换脚本 + 板端 demo</strong> 的模型做第一条闭环。<b>YOLOv5s @ 640×640</b> 是经典起点：结构清晰、COCO 预训练权重好下、FPS 表里有 RK3576 列。</p>
        <ul>
          <li>任务：多目标检测（框 + 类别 + 置信度）</li>
          <li>输入：1 张 640×640 RGB（letterbox 保比例）</li>
          <li>输出：3 个尺度的检测张量，decode 后约 8400 候选框</li>
          <li>在 NPU 上：主力卷积/C3 走 MAC；decode/NMS 在 CPU</li>
        </ul>
        <p>后续每一步都对应仓库讲义的一课：量化←02，任务列表/搬运←03，Toolkit2←04，板端三件套←04/05。</p>`,
    },
    {
      title: "01 · 取权重",
      where: "PC",
      body: `
        <p>不要自己训练。从 <code>ultralytics/yolov5</code> 或 <code>rknn_model_zoo</code> 拿到：</p>
        <ul class="checklist">
          <li>yolov5s.pt（或 zoo 里已导出的 onnx）</li>
          <li>convert.py（指定 target_platform）</li>
          <li>板端 C demo 源码 + 编译脚本 build-linux.sh</li>
          <li>示例图片 model.jpg</li>
        </ul>
        <p>交叉编译：model zoo 推荐 <b>Linaro GCC 6.3.1</b>。Windows 上转换走 <b>WSL2 + rknn-toolkit2 v2.3.2</b>（与百问网 3-3-1 同版本，可互抄命令）。</p>`,
    },
    {
      title: "02 · 导出 ONNX",
      where: "PC · WSL",
      body: `
        <p>训练框架解耦：PyTorch → ONNX，像「各家 RTL → 统一网表」。</p>
        <pre># ultralytics / yolov5 export 示意
python export.py --weights yolov5s.pt --imgsz 640 --include onnx
# 得到 yolov5s.onnx  （opset 注意与 Toolkit2 兼容）</pre>
        <p>检查点：用 netron 打开，确认输入 <code>images: [1,3,640,640]</code>，输出多尺度 concat/decode 头是否被 zoo 脚本特殊处理（有的 zoo 版本把 detect 解码拆到板端 CPU）。</p>`,
    },
    {
      title: "03 · 转 .rknn",
      where: "PC · Toolkit2",
      body: `
        <p>五个调用 = 五个概念：<b>config 芯片差异 · load 读模型 · build 量化+编译 · export 打包 · inference 仿真</b>。</p>
        <pre>from rknn.api import RKNN

rknn = RKNN(verbose=True)
rknn.config(mean_values=[[0, 0, 0]],
            std_values=[[255, 255, 255]],
            target_platform='rk3576')   # ← 只改这里换芯片
rknn.load_onnx('yolov5s.onnx')
rknn.build(do_quantization=True, dataset='./calib_list.txt')
rknn.export_rknn('yolov5s_rk3576.rknn')
rknn.init_runtime()                     # 不传 target = PC 仿真
outs = rknn.inference(inputs=[img])</pre>
        <p><code>.rknn</code> 不是通用格式，而是<strong>绑定 rk3576 算子清单 / NC1HWC2 排布 / 量化参数的任务包</strong>。RK3588 编的不能直接跑 3576。</p>`,
    },
    {
      title: "04 · 量化校准",
      where: "PC · build() 内部",
      body: `
        <p>PTQ 流程（对应 02 第 1 课手算的「校准定 scale」）：</p>
        <ul>
          <li>准备 <b>100~300 张</b>代表性图片路径列表 <code>calib_list.txt</code></li>
          <li>工具用浮点模型跑一遍，统计每层激活范围</li>
          <li>定每层 scale / zero_point → 生成 INT8 任务描述</li>
        </ul>
        <p>精度掉了走救援阶梯：</p>
        <ul class="checklist">
          <li>① 换更有代表性的校准集（最常见）</li>
          <li>② rknn.accuracy_analysis() 逐层余弦距离</li>
          <li>③ 混合量化：敏感层保留 FP16（3576 支持）</li>
          <li>④ QAT（端侧一般用不上）</li>
        </ul>
        <p>RK3576 独占武器：<code>quantized_dtype='w4a16'</code>（权重 4bit + 激活 FP16，group 32/64/128）——和 LLM 线联动。</p>`,
    },
    {
      title: "05 · PC 仿真",
      where: "PC · 无板",
      body: `
        <p>板未到手也能闭环<strong>数值正确性</strong>：</p>
        <ul>
          <li><code>rknn.init_runtime()</code> 不传 target → 模拟器推理</li>
          <li>对比浮点 ONNX 输出与量化后输出（余弦距离 / mAP 掉点）</li>
          <li>性能数字<strong>不能</strong>信模拟器——它不模拟时间</li>
        </ul>
        <p>调试第一问（IC 分层定位）：</p>
        <p><b>仿真对、真机错 → 驱动/硬件；仿真也错 → 模型/量化。</b></p>`,
    },
    {
      title: "06 · 推到板端",
      where: "PC → DshanPi-A1",
      body: `
        <pre># 传输二选一
adb push yolov5s_rk3576.rknn /userdata/
scp yolov5s_rk3576.rknn root@192.168.x.x:~/

# 板上先看环境（排查三件套之二）
cat /proc/rknpu/version
cat /sys/kernel/debug/rknpu/load
# dmesg | grep -i rknpu</pre>
        <p>本板注意：</p>
        <ul>
          <li>官方系统 <b>ArmbianOS</b>（带 NPU）≠ armbian.com 社区镜像</li>
          <li>默认账号 root / 100ask</li>
          <li>供电 Type-C PD ≥30W；联调 ssh/adb</li>
          <li>librknnrt 版本与 Toolkit2 配套；驱动过低先升固件</li>
        </ul>`,
    },
    {
      title: "07 · 七步 C API",
      where: "板端 · librknnrt",
      body: `
        <p>应用<strong>全程不碰寄存器</strong>：运行时解析任务列表，驱动只管上电/映射/递交。</p>
        <pre>rknn_context ctx;
rknn_init(&ctx, model, size, 0, NULL);          // 可绑核
rknn_query(ctx, RKNN_QUERY_IN_OUT_NUM, &io, …);
rknn_query(ctx, RKNN_QUERY_INPUT_ATTR,  &in,  …);
rknn_query(ctx, RKNN_QUERY_OUTPUT_ATTR, &out, …); // 含 scale/zp
rknn_inputs_set(ctx, 1, &input);                  // 预处理后的 640×640
rknn_run(ctx, NULL);                              // NPU 干活
rknn_outputs_get(ctx, 1, &output, …);             // INT8 + scale
// … CPU 反量化 / decode / NMS …
rknn_outputs_release(ctx, 1, &output);
rknn_destroy(&ctx);

// 绑核（RK3576 双核）
rknn_set_core_mask(ctx, RKNN_NPU_CORE_0);  // 或 _1 / _0_1</pre>
        <p>规格是 <code>query</code> 问出来的，换模型不用改应用骨架。多模型并行 = 多次 init + 各绑一核。</p>`,
    },
    {
      title: "08 · 预 / 后处理",
      where: "RGA + CPU",
      body: `
        <p><b>预处理（硬件）</b>：摄像头 1920×1080 NV12 → 640×640 RGB。用 CPU+OpenCV 会占满一核还多几趟拷贝；用 <b>RGA</b>（本板 2×RGA2-Pro）一拍完成。</p>
        <pre>// 零拷贝思想：传 dma-buf fd，数据不挪窝
V4L2 摄像头 ──fd──→ RGA resize/色转 ──fd──→ NPU
// API: rknn_create_mem_from_fd + rknn_set_io_mem</pre>
        <p><b>后处理（CPU）</b>：</p>
        <ul>
          <li>INT8 输出 × scale → 浮点</li>
          <li>decode：3 尺度 → 边界框 + objectness + 80 类</li>
          <li>NMS 去重叠 → 画框 / 业务逻辑</li>
        </ul>
        <p>NPU 算子列表外的一切都会回退 CPU——所以「NPU 不包打天下」，系统功夫在<strong>别让数据搬运堵车</strong>。</p>`,
    },
    {
      title: "09 · 验收排查",
      where: "板端 · 闭环",
      body: `
        <p>跑通官方 demo：</p>
        <pre>cd rknn_yolov5_demo_Linux
./rknn_yolov5_test_model ./model/RK3576/yolov5s-640.rknn model.jpg
cat /sys/kernel/debug/rknpu/load   # 不应一直是 0</pre>
        <ul class="checklist">
          <li>load = 0% → 模型没上 NPU，查算子回退 / 驱动 / 模型路径</li>
          <li>报驱动版本过低 → 查 librknnrt ↔ Toolkit2 ↔ rknpu 配套</li>
          <li>框全乱 / 类别错位 → 预处理 mean/std 或 letterbox 不一致</li>
          <li>mAP 掉得多 → 回到校准集 / accuracy_analysis</li>
          <li>FPS 不够 → 查利用率、是否单核、RGA 是否被绕过、是否零拷贝</li>
        </ul>
        <p>进阶实验：双模型各绑一核；同一模型 <code>_0_1</code> 联合；对比 FP16 / INT8 / W4A16 的精度-速度。</p>`,
    },
  ];

  const TENSOR_HINTS = [
    "原始帧：V4L2 / 读图。分辨率远大于模型输入，格式常是 NV12/BGR。",
    "RGA：缩放 + letterbox + 色转。CPU 不该做这件事。零拷贝传 fd。",
    "输入量化：x_q = round(x/s)+z。均值方差来自训练预处理，config 里要对上。",
    "NPU 主力层：卷积/C3/Concat 等在支持列表内。任务列表由 .rknn 带来。",
    "输出 INT8+scale → CPU 反量化，reshape 成 3 个尺度的检测图。",
    "decode + NMS：阈值过滤、按类抑制重叠框。这是业务结果。",
  ];

  function renderModelStep(idx) {
    $$(".mstep").forEach((s, i) => s.classList.toggle("active", i === idx));
    const s = MODEL_STEPS[idx];
    $("#model-detail-title").textContent = s.title;
    $("#model-where").textContent = s.where;
    $("#model-detail-body").innerHTML = s.body;
  }

  $$(".mstep").forEach((btn) => {
    btn.addEventListener("click", () => renderModelStep(+btn.dataset.mstep));
  });

  $$(".t-node").forEach((node) => {
    node.addEventListener("click", () => {
      $$(".t-node").forEach((n) => n.classList.remove("active"));
      node.classList.add("active");
      const i = +node.dataset.t;
      $("#tensor-hint").textContent = TENSOR_HINTS[i] || "";
    });
  });

  let flowTimer = null;
  $("#model-play-flow")?.addEventListener("click", () => {
    if (flowTimer) {
      clearInterval(flowTimer);
      flowTimer = null;
      $("#model-play-flow").textContent = "▶ 播放数据流";
      return;
    }
    let i = 0;
    const nodes = $$(".t-node");
    const tick = () => {
      nodes.forEach((n, j) => n.classList.toggle("active", j === i));
      $("#tensor-hint").textContent = TENSOR_HINTS[i] || "";
      i = (i + 1) % nodes.length;
    };
    tick();
    $("#model-play-flow").textContent = "⏸ 暂停";
    flowTimer = setInterval(tick, 1400);
  });

  /* ---------- milestones ---------- */
  const MILESTONES = [
    { done: true, date: "09-09", title: "开机 → ssh → 驱动 ≥0.9.8", ev: "RKNPU driver v0.9.8（/sys/kernel/debug/rknpu/version）；load 输出 Core0/Core1 实证双核", go: "lectures" },
    { done: true, date: "09-09", title: "远程双通道 ssh + VNC", ev: "x11vnc :5900 镜像控制台；ssh / SFTP 日常通道", go: "cheat" },
    { done: true, date: "09-10", title: "YOLOv5s 全链路（转换→编译→部署→推理）", ev: "bus.jpg 检出 person×3 + bus（最高 0.88）；推理时 Core0 5~8%", go: "model" },
    { done: false, date: "", title: "core_mask 单核 vs 双核 FPS 对比", ev: "记录加速比，解释为什么 ≠ 2×（03 课多核玩法）", go: "demo-npu" },
    { done: false, date: "", title: "W4A16 vs INT8（accuracy_analysis 精度 + FPS）", ev: "同一模型两种量化对比（02 课 W4 理论落地）", go: "demo-quant" },
    { done: false, date: "", title: "（选做）Qwen2-0.5B w4a16 跑通", ev: "对照官方 32.56 tok/s（seqlen 128 / new_tokens 64；6G 内存档）", go: "lectures" },
  ];
  function renderMilestones() {
    const host = $("#ms-list");
    if (!host) return;
    host.innerHTML = MILESTONES.map(
      (m, i) => `
      <div class="ms-item${m.done ? " done" : ""}">
        <div class="ms-check">${m.done ? "✓" : ""}</div>
        <div class="ms-body">
          <div class="ms-title">${m.title}${m.done ? `<span class="ms-date micro">${m.date}</span>` : ""}</div>
          <div class="ms-ev micro">${m.ev}</div>
        </div>
        <button class="secondary-btn ms-go" data-ms="${i}">前往相关 →</button>
      </div>`
    ).join("");
    $$(".ms-go", host).forEach((btn) =>
      btn.addEventListener("click", () => showView(MILESTONES[+btn.dataset.ms].go))
    );
  }

  /* ---------- full-text search ---------- */
  let searchIdx = null;
  let searchLastTerm = "";
  function buildSearchIdx() {
    searchIdx = lectList.map((l, i) => {
      const tmp = document.createElement("div");
      tmp.innerHTML = l.html || "";
      const text = (tmp.textContent || "").replace(/\s+/g, " ");
      return { i, title: l.title || "", stage: l.stage || "", text: text + " " + (l.title || "") };
    });
  }
  function escHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function runSearch() {
    const input = $("#search-input");
    const host = $("#search-results");
    const meta = $("#search-meta");
    if (!input || !host) return;
    const q = input.value.trim().toLowerCase();
    if (!q) {
      host.innerHTML = '<p class="hint">输入关键词开始。回车跳到第一个命中的讲义。</p>';
      meta.textContent = "—";
      return;
    }
    if (!searchIdx) buildSearchIdx();
    const terms = q.split(/\s+/).filter(Boolean);
    const hits = [];
    searchIdx.forEach((entry) => {
      const hay = entry.text.toLowerCase();
      const pos = terms.map((t) => hay.indexOf(t));
      if (!pos.every((p) => p >= 0)) return;
      const score = terms.reduce((s, t) => {
        let c = 0, x = 0;
        while ((x = hay.indexOf(t, x)) >= 0) { c++; x += t.length; }
        return s + c;
      }, 0);
      hits.push({ ...entry, score, first: Math.min(...pos) });
    });
    hits.sort((a, b) => b.score - a.score);
    meta.textContent = hits.length ? `${hits.length} 篇命中` : "无结果";
    if (!hits.length) {
      host.innerHTML = '<p class="hint">没有命中的讲义，换个词试试。</p>';
      return;
    }
    searchLastTerm = terms[0];
    host.innerHTML = hits.slice(0, 12).map((h) => {
      const start = Math.max(0, h.first - 46);
      const snip = escHtml(h.text.slice(start, start + 168));
      return `
      <button class="search-result" data-i="${h.i}">
        <div class="sr-head"><span class="micro">${escHtml(h.stage)}</span><b>${escHtml(h.title)}</b></div>
        <p class="sr-snip">…${snip}…</p>
      </button>`;
    }).join("");
    $$(".search-result", host).forEach((el) =>
      el.addEventListener("click", () => {
        showView("lectures");
        openLecture(+el.dataset.i);
        highlightInLecture(searchLastTerm);
      })
    );
  }
  function highlightInLecture(term) {
    try {
      const body = $("#lect-body");
      if (!body || !term) return;
      const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const idx = node.textContent.toLowerCase().indexOf(term.toLowerCase());
        if (idx >= 0 && node.parentNode) {
          const range = document.createRange();
          range.setStart(node, idx);
          range.setEnd(node, idx + term.length);
          const mark = document.createElement("mark");
          try { range.surroundContents(mark); } catch { /* 跨元素边界就跳过高亮 */ }
          mark.scrollIntoView({ block: "center", behavior: "smooth" });
          return;
        }
      }
    } catch { /* 高亮失败不影响阅读 */ }
  }
  function initSearch() {
    const input = $("#search-input");
    if (!input) return;
    input.addEventListener("input", runSearch);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const first = $(".search-result");
        if (first) first.click();
      }
    });
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        showView("search");
        input.focus();
        input.select();
      }
    });
  }

  /* ---------- QA → flashcards（问答收录自动转闪卡） ---------- */
  function mergeQaFlashcards() {
    try {
      const qa = lectList.find((l) => l.id === "l00b");
      if (!qa || !qa.html) return;
      const doc = new DOMParser().parseFromString(qa.html, "text/html");
      let added = 0;
      doc.querySelectorAll("h3").forEach((h) => {
        const q = (h.textContent || "").replace(/^Q\d+\s*[:：]\s*/, "").trim();
        if (!q) return;
        const points = [];
        let node = h.nextElementSibling;
        while (node && !/^H3$/i.test(node.tagName)) {
          if (/^(UL|OL)$/i.test(node.tagName)) {
            node.querySelectorAll("li").forEach((li) => points.push(li.textContent.trim()));
          }
          node = node.nextElementSibling;
        }
        if (!points.length) return;
        FLASH.push({
          q: "问答 · " + q,
          a: points.map((p) => "• " + p).join("\n"),
        });
        added++;
      });
      if (added) {
        flashDeck = FLASH.map((_, i) => i);
        flashIdx = 0;
      }
    } catch { /* 问答解析失败不影响闪卡本体 */ }
  }

  /* ---------- boot ---------- */
  function boot() {
    initTheme();
    updateProgressUI();
    renderPath();
    renderConv();
    renderPool();
    renderQuant();
    calcMac();
    renderAttn();
    calcN2();
    renderPipe(0);
    initQuiz(false);
    renderFlash();
    initPrinciples();
    renderModelStep(0);
    renderLectIndex();
    openLecture(0, { silent: true });
    renderBitflow();
    renderMilestones();
    initSearch();
    mergeQaFlashcards();
    renderFlash();
    // HTML marks buf selected by default; keep detail in sync
    const macBlock = $('.npu-block[data-part="mac"]');
    if (macBlock) {
      $$(".npu-block").forEach((b) => b.classList.remove("selected"));
      macBlock.classList.add("selected");
      const info = NPU_PARTS.mac;
      $("#npu-detail-title").textContent = info.title;
      $("#npu-detail-body").innerHTML = info.body;
    }
    renderResume();
    window.addEventListener("hashchange", applyRoute);
    applyRoute();
    booted = true;
    writeHash(currentViewName());
  }

  boot();
})();
