# Mortar CMS — multi-stage Docker build
# Build stage compiles admin/frontend/server + theme bundles (mirrors build.sh);
# the runtime stage ships only production deps and the built artifacts.

# ---- Build stage ----
FROM node:22-slim AS build
WORKDIR /app

# better-sqlite3 / sharp ship prebuilt binaries for linux glibc; the toolchain
# stays as a fallback if a prebuild download ever fails
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json server/
COPY admin/package.json admin/package-lock.json admin/
COPY frontend/package.json frontend/package-lock.json frontend/
RUN cd server && npm ci --no-audit --no-fund \
 && cd ../admin && npm ci --no-audit --no-fund \
 && cd ../frontend && npm ci --no-audit --no-fund

# Build everything
COPY . .
RUN cd admin && npx vite build \
 && cd ../frontend \
    && npx vite build \
    && npx esbuild esm/react.js --bundle --format=esm --minify --define:process.env.NODE_ENV=\"production\" --outfile=public/esm-react.js \
    && npx esbuild esm/router.js --bundle --format=esm --external:react --external:react-dom --outfile=public/esm-router.js \
    && for t in default magazine aurora twentytwentyfour twentytwentyone twentynineteen twentyseventeen softstore; do THEME_NAME=$t npx vite build --config vite.themes.config.ts; done \
    && for t in default magazine aurora twentytwentyfour twentytwentyone twentynineteen twentyseventeen softstore; do cp dist/themes/$t.js ../server/themes/$t/theme.js; done \
    && npx vite build \
 && cd ../server && npx tsc

# Keep only production dependencies for the runtime image
RUN cd server && npm prune --omit=dev

# ---- Runtime stage ----
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Writable state directories (data = SQLite db, uploads, backups)
RUN mkdir -p /app/server/data /app/server/uploads /app/server/backups \
    && chown -R node:node /app

COPY --from=build --chown=node:node /app/server /app/server
COPY --from=build --chown=node:node /app/admin/dist /app/admin/dist
COPY --from=build --chown=node:node /app/frontend/dist /app/frontend/dist

USER node
EXPOSE 3001
VOLUME ["/app/server/data", "/app/server/uploads"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "/app/server/dist/index.js"]
