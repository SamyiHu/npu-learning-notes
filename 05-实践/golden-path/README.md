# RK3576 Golden Path：从零跑通 YOLOv5s

> 目标：给零基础读者一套唯一入口。不要同时参考多个教程命令。
> 本脚本在 **WSL2 Ubuntu** 中运行；板端通过 SSH 访问。每一步都会检查前置条件，并告诉你预期结果。

## 固定环境

| 项目 | 版本 |
|---|---|
| Python | 3.12 venv |
| rknn-toolkit2 | 2.3.2 |
| onnx | 1.16.1 |
| setuptools | <81 |
| 目标芯片 | rk3576 |
| 目标板 | DshanPi-A1 / RK3576 |
| 模型 | YOLOv5s-relu |
| 精度 | INT8 |

## 运行顺序

```bash
cd 05-实践/golden-path
bash 00_check_env.sh
bash 01_prepare_model_zoo.sh
bash 02_convert_yolov5.sh
bash 03_build_demo.sh
BOARD_USER=root BOARD_HOST=192.168.1.100 bash 04_run_on_board.sh
```

`BOARD_USER` 和 `BOARD_HOST` 必须改成你的板子信息。脚本不会自动刷机，也不会删除板子上的文件。

## 预期结果

1. `02_convert_yolov5.sh` 生成 `yolov5.rknn`。
2. `03_build_demo.sh` 生成 `install/rk3576_linux_aarch64/rknn_yolov5_demo/`。
3. `04_run_on_board.sh` 在板端生成 `out.png`。
4. 连续推理时，`/sys/kernel/debug/rknpu/load` 不应始终为 0。
5. 结果中能看到 person、bus 等检测框；不同图片和模型版本的置信度可能不同。

## 失败时不要做什么

不要连续换命令、不要同时升级多个包、不要把 Windows 路径直接传给 Linux 命令。按以下顺序检查：

```text
环境版本 → 文件路径 → 模型 shape → 权限 → 板端网络 → 驱动/运行时
```

把完整报错保存到 `学习记录.md`，包括命令、当前目录和版本。

## 产物与证据

建议在实验目录保存：

```text
model-zoo.commit.txt
toolkit-version.txt
convert.log
build.log
run.log
rknpu-load.txt
out.png
benchmark.md
```

`benchmark.md` 至少写清楚：是否包含前后处理、预热次数、测试次数、平均/P95 延迟、FPS、精度和核心数。
