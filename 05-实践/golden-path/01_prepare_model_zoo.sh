#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
WORK="${RKNN_WORK:-$ROOT/work}"

echo "工作目录：$WORK"
mkdir -p "$WORK"
cd "$WORK"

if [ ! -d rknn_model_zoo ]; then
  echo "下载 rknn_model_zoo ..."
  git clone https://github.com/airockchip/rknn_model_zoo.git
fi

cd rknn_model_zoo
git rev-parse HEAD > "$WORK/model-zoo.commit.txt"
git status --short > "$WORK/model-zoo.status.txt"

echo "model zoo commit：$(cat "$WORK/model-zoo.commit.txt")"
echo "下一步：bash 02_convert_yolov5.sh"
