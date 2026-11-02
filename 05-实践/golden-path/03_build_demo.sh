#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
WORK="${RKNN_WORK:-$ROOT/work}"
ZOO="$WORK/rknn_model_zoo"

[ -d "$ZOO" ] || { echo "请先运行 01_prepare_model_zoo.sh"; exit 1; }
[ -f "$WORK/yolov5.rknn" ] || { echo "请先运行 02_convert_yolov5.sh"; exit 1; }

if ! command -v aarch64-linux-gnu-g++ >/dev/null; then
  echo "缺少交叉编译器：sudo apt install cmake g++-aarch64-linux-gnu"
  exit 1
fi

cd "$ZOO"
GCC_COMPILER=aarch64-linux-gnu bash build-linux.sh -t rk3576 -a aarch64 -d yolov5 2>&1 | tee "$WORK/build.log"
OUT="install/rk3576_linux_aarch64/rknn_yolov5_demo"
[ -d "$OUT" ] || { echo "编译失败：没有找到 $OUT"; exit 1; }
echo "编译成功：$OUT"
echo "下一步：BOARD_USER=... BOARD_HOST=... bash 04_run_on_board.sh"
