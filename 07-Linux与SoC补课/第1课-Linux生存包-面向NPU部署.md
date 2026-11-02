# 第 1 课：Linux 生存包——为 NPU 部署补齐刚好够用的 Linux

> 学习日期：2026-08-17（讲义编写日，自学后待讨论）
> 阶段：07-Linux与SoC补课（并行线，可随时插入学习）
> 前提：你有 51/ARM0P/RISC-V 裸机与 MCU 开发经验，没系统用过 Linux
> 原则：**不追求"学会 Linux"，只追求"独立完成 NPU 部署所需的全部操作"**。多了不看

---

## 一、核心一句话

**你熟悉的 MCU 世界是"我拥有整台机器"；Linux 世界是"操作系统拥有机器，你只是租户"。**
租户的好处：内存/调度/驱动/文件系统都有人管，你只管跑自己的程序——NPU 这种复杂 SoC 没有操作系统根本玩不转。

---

## 二、MCU → Linux 思维转换表（逐条对上你已有的知识）

| MCU 世界（你熟悉） | Linux 世界 | 差异要点 |
|---|---|---|
| `while(1)` 主循环独占 CPU | 多进程/线程，内核调度 | 你的程序只是众多进程之一，别假设独占 |
| 直接读写寄存器（`*(volatile u32*)0x...`） | 一切经驱动，用户态禁摸硬件 | 硬件被内核管着，访问=读写 `/dev` 下的设备文件 |
| JTAG/SWD 调试 | ssh/串口 + `printf`/gdb + `dmesg` | 板子跑在桌面上，网线就是你的调试线 |
| 烧录 hex | 复制文件 + 执行 | 程序就是文件：`scp` 过去，`./` 跑起来 |
| 看内存外设手册写初始化 | 设备树描述硬件，驱动按描述初始化 | 见第 3 课 |
| 中断服务函数 | 驱动里的中断处理，用户态只收到"事件" | 用户态拿不到裸中断 |
| 一切自己写 | `apt` 装现成的 | 工具链、OpenCV、Python 全是现成的 |

---

## 三、六个必须懂的概念

### 1. 一切皆文件

设备、内核信息、进程……都伪装成文件，读写文件=和它们打交道：

```
/dev/rknpu          NPU 设备节点（驱动注册的）
/dev/dri/renderD128 NPU 的 DRM 节点
/dev/video*         摄像头
/proc/cpuinfo       CPU 信息；NPU 驱动版本优先看 /sys/kernel/debug/rknpu/version（不同 BSP 路径可能不同）
/sys/kernel/debug/  调试信息（如 rknpu/load 占用率）
```

### 2. 用户与权限

- 一切以普通用户操作，`sudo` 临时提权（root 日常别用）
- **Linux 认"可执行位"不认后缀**：`chmod +x demo` 后才能 `./demo`——从 Windows 拷来的程序跑不动，九成是没这个位
- 读写 debugfs 通常要 root：`sudo cat /sys/kernel/debug/rknpu/load`

### 3. 进程

```
ps aux | grep demo      看进程        top / htop    看占用（CPU/内存）
./demo &                后台跑        kill <pid>    停掉
```

### 4. 包管理（发行版送你的"应用商店"）

```
sudo apt update && sudo apt install build-essential cmake python3-pip
```

嵌入式板上多为 Debian/Ubuntu 系（apt），和 PC 一致——所以 PC 上练的命令板上全能用。

### 5. 环境变量与动态库（跑别人程序的头号报错来源）

```
./rknn_demo
  → error while loading shared libraries: librknnrt.so: cannot open...
```

含义：程序链接的动态库（类似你 MCU 用的预编译库，但**运行时才查找**）没找到。三板斧：

```
ldd ./rknn_demo                 ① 看它缺谁、找到没有（not found=缺）
export LD_LIBRARY_PATH=/usr/lib:$LD_LIBRARY_PATH   ② 临时指路
sudo ldconfig                   ③ 或把库拷到 /usr/lib 后刷新缓存
```

（对上 04 第 2 课：librknnrt.so 就是要这样安置的库。）

### 6. 内核日志

```
dmesg | tail -50                硬件/驱动在"抱怨"什么都在这
sudo dmesg | grep -i rknpu      NPU 驱动初始化/报错
```

相当于你 MCU 时代的"外设初始化 printf"，只是打印方换成了内核。

---

## 四、NPU 部署命令清单（按任务背）

```bash
# ── 上板（两选一）──────────────────────────
ssh rock@192.168.1.100              # 网口：登进去干活（用户名/地址按板厂文档）
adb shell                           # USB：RK 板常用 adb（安卓血统）
# ── 传文件 ────────────────────────────────
scp yolov5s.rknn rock@192.168.1.100:~/    # 网络
adb push yolov5s.rknn /userdata/          # USB
# ── 跑程序 ────────────────────────────────
chmod +x rknn_yolov5_demo           # 给可执行位（第一次必做）
./rknn_yolov5_demo model.rknn img.jpg
# ── NPU 体检 ─────────────────────────────
cat /sys/kernel/debug/rknpu/version 2>/dev/null || cat /proc/rknpu/version   # 驱动版本（连板调试第一步）
cat /sys/kernel/debug/rknpu/load   # NPU 占用率
dmesg | grep -i rknpu              # 驱动日志
# ── 排错辅助 ─────────────────────────────
top                                 # 谁在吃 CPU（NPU 回退 CPU 时它会告诉你）
ldd ./demo | grep "not found"      # 缺库检查
df -h ; free -h                    # 磁盘/内存余量（模型+运行时吃内存）
```

---

## 五、编译：交叉 vs 板上原生

跑 model zoo 的 C demo 要编译，两条路：

| | 板上原生编译 | PC 交叉编译 |
|---|---|---|
| 做法 | 板上 `gcc` 直接编 | PC 装 `aarch64-linux-gnu-gcc`，编完 scp 回板 |
| 优点 | 简单，不会错架构 | 快（板子慢），正式产品流程 |
| 适合 | 学习阶段首选 | 熟练后/CI | 

你验证环境天天交叉编译，这块零障碍；新增的唯一认知：**产物架构必须匹配**（x86 程序拷上 ARM 板报 `Exec format error`，反向同理）。model zoo 的 `build-linux.sh` 里面就是一套交叉编译+打包脚本，读一遍很有收获。

---

## 六、现在就能练（无板）

在 Windows 上装 WSL2（Ubuntu），或任何虚拟机/云主机，把上面命令全部过一遍：

1. [ ] apt 装 gcc，写 hello.c 编译运行
2. [ ] 手动制造一次"缺库"：`export LD_LIBRARY_PATH=` 改错路径，观察 ldd/not found
3. [ ] `ls /dev` 数一数设备节点；`cat /proc/cpuinfo`
4. [ ] chmod 实验：去掉 x 位再跑，看报错
5. [ ] WSL 里按 04 第 1 课装 RKNN-Toolkit2，跑通一次模型转换（一举两得）

---

## 七、里程碑检查

- [ ] 能说清"MCU 独占机器 / Linux 是租户"的三条具体差异（调度、硬件访问、程序=文件）
- [ ] 不看清单能写出：上板→传文件→给执行位→跑→看 NPU 占用率 的完整命令序列
- [ ] 遇到"shared library not found"知道三板斧（ldd / LD_LIBRARY_PATH / ldconfig）
- [ ] 理解动态库运行时查找机制与交叉编译架构匹配问题

---
<!-- BEGINNER_EXERCISES -->
## 小白练习与答案 · Linux 生存包
> 每题都要求写出过程或排查顺序；不要只写“懂了”。

**计算 1**：一个程序执行 `chmod +x demo` 后，如何运行？

<details>
<summary>答案</summary>

`./demo`。

</details>

**解释 2**：为什么 debugfs 命令经常需要 sudo？

<details>
<summary>答案</summary>

debugfs 暴露内核调试信息，权限通常比普通文件更严格。

</details>

**调试 3**：`permission denied` 与 `command not found` 的排查重点有何不同？

<details>
<summary>答案</summary>

前者看权限/文件系统；后者看安装、PATH、命令拼写和架构。

</details>
