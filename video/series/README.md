# NPU 分级讲解系列（重制版）

从零基础到 RK3576 实战，共 10 集。1920×1080、Edge 神经语音配音、程序化合成配乐、逐句字幕。

## 相比上一版的改动

| 项目 | 上一版 | 本版 |
|---|---|---|
| 画面 | 静态文字卡 + 淡入淡出 | 逐场景动画讲解：bit 逐位点亮、MAC 阵列脉动、量化条形增长、数据流扫过、滑窗/点积演示 |
| 配音 | Windows SAPI（机械） | Edge 神经语音（Xiaoxiao / Yunxi / Yunyang 三种音色，按分级分配） |
| 配乐 | 无 | 每集独立程序化合成技术 BGM：sub drone + off-beat bass + 稀疏琶音 + 场景 riser |
| 混音 | 只有旁白 | 旁白 + BGM 混合，旁白驱动的闪避（ducking），软限幅 |

## 分级结构

| 级别 | 定位 | 集数 | 时长 | 音色 |
|---|---|---|---|---|
| **L1 · 零基础** | 数字、张量、卷积 | 3 | ~5.1 min | Xiaoxiao（女，温暖） |
| **L2 · 硬件原理** | MAC、存储、量化、RKNPU | 4 | ~7.0 min | Yunxi / Yunyang（男，阳光/专业） |
| **L3 · 实战部署** | 部署链路、RK3576、性能 | 3 | ~5.9 min | Yunxi / Yunyang |

## 分集目录

### L1 · 零基础
1. [L1-01 数字与精度](L1-01-数字与精度/) — 1 byte 到 INT8 · 2:00
2. [L1-02 矩阵与张量](L1-02-矩阵与张量/) — 向量、矩阵、shape · 1:34
3. [L1-03 卷积、池化与 BN](L1-03-卷积池化BN/) — CNN 逐层做的事 · 1:33

### L2 · 硬件原理
4. [L2-01 MAC 阵列与数据流](L2-01-MAC阵列与数据流/) — 四种数据流 · 1:58
5. [L2-02 存储层次与数据搬运](L2-02-存储层次与搬运/) — DDR/SRAM/DMA/tiling · 1:52
6. [L2-03 量化到硬件](L2-03-量化与requantization/) — scale/零点/requant · 1:36
7. [L2-04 RKNPU 架构实例](L2-04-RKNPU架构实例/) — 一次推理的全旅程 · 1:37

### L3 · 实战部署
8. [L3-01 部署链路](L3-01-部署链路/) — ONNX 到 .rknn · 1:50
9. [L3-02 RK3576 实践](L3-02-RK3576全链路/) — 转换/编译/部署/验证 · 2:00
10. [L3-03 性能与精度](L3-03-性能与精度/) — 怎么把话说清楚 · 2:02

## 每集内容

```text
final.mp4          成片（1920×1080, H.264 + AAC 混合音轨）
subtitles.srt/vtt  逐句字幕，与配音对齐
lecture-notes.md   逐段讲义 + 练习 + 对应仓库讲义
narration.txt      旁白原文
audio/nNN.mp3      Edge 神经语音逐句配音
audio/bgm.wav      程序化合成配乐
audio/mix.wav      旁白 + BGM 混合主音轨
index.html         源工程
```

## 推荐观看顺序

```text
完全零基础    → L1-01 → L1-02 → L1-03 → L2-01 → L2-02 → L2-03 → L2-04 → L3-01 → L3-02 → L3-03
懂硬件不懂 AI → L1-02 → L1-03 → L2-01 → L2-02 → L3-01 → L3-02
只想跑通板子  → L3-01 → L3-02 → L3-03
```

## 重新生成

```bash
node _gen/build.js              # 全部 10 集（TTS + BGM + 混合 + 工程）
node _gen/build.js L2-01        # 只重生成某一集
node _gen/build.js L2-01 --no-audio   # 只重生成工程，不重做音频

# 单独重做某一集
python _gen/tts_edge.py <projdir> <ep_id> <level> <projdir>/narration.txt
python _gen/bgm.py --duration <s> --out <projdir>/audio/bgm.wav --marks '<json>' --seed <n> --bpm <b> --key <k> --intensity <i>
python _gen/mix.py --proj <projdir> --duration <s> --bgm <bgm.wav> --out <projdir>/audio/mix.wav

npx hyperframes render <projdir> --output final.mp4 --quality high
```

## 视觉与听觉规范

视觉沿用 NPU Lab 语言：硅片 floorplan + 测量仪表。深底 `#0B0A12`、级别配色 L1 绿 `#5BBF9A` / L2 铜 `#D4895A` / L3 品红 `#E85D7A`。

听觉：神经语音讲解 + 每集独立合成的技术 BGM，旁白处自动降低 BGM 音量。

## 已知待办

- L2-03 成片第 5 句旁白仍是旧版（“取整后除以比例”），文字稿/字幕/index.html 已修正为“先除以比例再取整”；mp4 音频需重跑 `node _gen/build.js L2-03` + hyperframes 重录。
