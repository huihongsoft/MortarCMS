#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "=== Building Admin ==="
cd admin && npx vite build
echo "=== Building Frontend ==="
cd ../frontend && npx vite build
echo "=== Building React ESM (single-instance via importmap) ==="
npx esbuild esm/react.js --bundle --format=esm --minify --define:process.env.NODE_ENV=\"production\" --outfile=public/esm-react.js
npx esbuild esm/router.js --bundle --format=esm --external:react --external:react-dom --outfile=public/esm-router.js
echo "=== Building Themes (standalone bundles) ==="
rm -rf dist/themes
for t in default magazine twentytwentyfour; do
  THEME_NAME=$t npx vite build --config vite.themes.config.ts
done
# Copy theme bundles into server/themes for unified runtime loading
for t in default magazine twentytwentyfour; do
  mkdir -p ../server/themes/$t
  cp dist/themes/$t.js ../server/themes/$t/theme.js
done
# Rebuild so public/ esm files land in dist
npx vite build
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
