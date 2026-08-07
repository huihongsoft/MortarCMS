#!/bin/bash
cd "$(dirname "$0")/server"
while true; do
  echo "[$(date)] Starting Mortar server..."
  npx tsx src/index.ts 2>&1
  echo "[$(date)] Server exited, restarting in 2s..."
  sleep 2
done
