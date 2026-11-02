#!/usr/bin/env bash
set -euo pipefail

echo "== 1/5 基本工具 =="
command -v git >/dev/null || { echo "缺少 git：sudo apt install git"; exit 1; }
command -v python3 >/dev/null || { echo "缺少 python3"; exit 1; }
command -v cmake >/dev/null || echo "提示：稍后需要 cmake"

echo "== 2/5 Python =="
python3 --version
python3 - <<'PY'
import sys
print("Python executable:", sys.executable)
print("版本建议：3.12.x；其他版本可能需要改变依赖版本")
PY

echo "== 3/5 WSL =="
if grep -qi microsoft /proc/version; then
  echo "检测到 WSL。"
else
  echo "提示：当前不是 WSL；RKNN-Toolkit2 官方 wheel 仅支持 Linux x86_64/ARM64。"
fi

echo "== 4/5 交叉工具链 =="
if command -v aarch64-linux-gnu-g++ >/dev/null; then
  aarch64-linux-gnu-g++ --version | head -1
else
  echo "稍后运行：sudo apt install cmake g++-aarch64-linux-gnu"
fi

echo "== 5/5 完成 =="
echo "下一步：bash 01_prepare_model_zoo.sh"
