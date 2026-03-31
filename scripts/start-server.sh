#!/bin/bash
PORT=4000
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 既に起動済みなら kill してから再ビルド
if lsof -ti:$PORT > /dev/null 2>&1; then
  kill $(lsof -ti:$PORT) 2>/dev/null
  sleep 1
fi

cd "$PROJECT_DIR" || exit 1
pnpm run build > /dev/null 2>&1 || { echo "Build failed" >&2; exit 1; }
SERVER_ENTRY=$(find build/server -name 'index.js' -type f | head -1)
PORT=$PORT pnpm dlx react-router-serve "$SERVER_ENTRY" > /dev/null 2>&1 &

for i in $(seq 1 30); do
  if lsof -ti:$PORT > /dev/null 2>&1; then
    echo "http://localhost:$PORT"
    exit 0
  fi
  sleep 0.5
done

echo "Server failed to start on port $PORT" >&2
exit 1
