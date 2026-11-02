#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
WORK="${RKNN_WORK:-$ROOT/work}"
ZOO="$WORK/rknn_model_zoo"
OUT="$ZOO/install/rk3576_linux_aarch64/rknn_yolov5_demo"
BOARD_USER="${BOARD_USER:-}"
BOARD_HOST="${BOARD_HOST:-}"
REMOTE_DIR="${REMOTE_DIR:-/root/rknn_yolov5_demo}"

[ -n "$BOARD_USER" ] && [ -n "$BOARD_HOST" ] || { echo "请设置 BOARD_USER 和 BOARD_HOST"; exit 1; }
[ -d "$OUT" ] || { echo "请先运行 03_build_demo.sh"; exit 1; }

echo "推送 demo 到 $BOARD_USER@$BOARD_HOST:$REMOTE_DIR"
ssh "$BOARD_USER@$BOARD_HOST" "mkdir -p '$REMOTE_DIR'"
scp -r "$OUT/." "$BOARD_USER@$BOARD_HOST:$REMOTE_DIR/"
ssh "$BOARD_USER@$BOARD_HOST" "cd '$REMOTE_DIR' && export LD_LIBRARY_PATH=\"\$PWD/lib:\$LD_LIBRARY_PATH\" && ./rknn_yolov5_demo model/yolov5.rknn model/bus.jpg | tee /root/rknn-run.log && (cat /sys/kernel/debug/rknpu/load 2>/dev/null || cat /proc/rknpu/load) | tee /root/rknpu-load.txt"
echo "板端运行结束。把 /root/rknn-run.log、/root/rknpu-load.txt 和 out.png 取回实验记录。"
