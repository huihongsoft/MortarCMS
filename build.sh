#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "=== Building Admin ==="
cd admin && npx vite build
echo "=== Building Frontend ==="
cd ../frontend && npx vite build
echo "=== Restarting Server ==="
kill $(lsof -ti:3001) 2>/dev/null || true
sleep 1
cd ../server && npx tsx src/index.ts &
sleep 3
echo ""
echo "=== Ready ==="
echo "Admin:  http://localhost:3001/admin"
echo "Site:   http://localhost:3001"
echo "Login:  admin@mortar.dev / admin123"
wait
