#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
WORK="${RKNN_WORK:-$ROOT/work}"
ZOO="$WORK/rknn_model_zoo"

[ -d "$ZOO" ] || { echo "请先运行 01_prepare_model_zoo.sh"; exit 1; }
cd "$ZOO"

if [ ! -d "$WORK/venv" ]; then
  python3 -m venv "$WORK/venv"
fi
# shellcheck disable=SC1091
source "$WORK/venv/bin/activate"
python -m pip install --upgrade pip
python -m pip install 'setuptools<81' 'onnx==1.16.1' 'rknn-toolkit2==2.3.2'

cd examples/yolov5/model
if [ ! -f yolov5s_relu.onnx ]; then
  bash download_model.sh
fi
cd ../python
python convert.py ../model/yolov5s_relu.onnx rk3576 i8 2>&1 | tee "$WORK/convert.log"

[ -f yolov5.rknn ] || { echo "转换失败：没有生成 yolov5.rknn"; exit 1; }
cp yolov5.rknn "$WORK/yolov5.rknn"
echo "转换成功：$WORK/yolov5.rknn"
echo "下一步：bash 03_build_demo.sh"
