# 预期结果与验收表

| 步骤 | 预期 | 不符合时先查 |
|---|---|---|
| `00_check_env.sh` | WSL、Python、git 可用 | Python/WSL 是否正确 |
| `01_prepare_model_zoo.sh` | 记录 model zoo commit | 网络、git clone |
| `02_convert_yolov5.sh` | 生成 `yolov5.rknn` | onnx/setuptools/rknn-toolkit2 版本 |
| `03_build_demo.sh` | 生成板端 demo 目录 | `g++-aarch64-linux-gnu`、cmake |
| `04_run_on_board.sh` | 生成 `out.png` | IP、ssh、动态库、模型路径 |
| NPU load | 连续推理时不是始终 0 | 是否正在采样、权限、算子回退、驱动/库版本 |

## 记录模板

```text
日期：
model zoo commit：
rknn-toolkit2：
librknnrt：
rknpu driver：
模型：
输入图片：
命令：
输出：
NPU load：
耗时：
FPS：
是否包含前后处理：
失败信息：
修复动作：
```
