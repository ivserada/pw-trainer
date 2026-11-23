# ---------- deps stage: устанавливаем все workspace-зависимости ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
COPY tests/package.json tests/
RUN npm ci --no-audit --no-fund

# ---------- build stage: собираем клиент ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules node_modules
COPY tsconfig.base.json package.json ./
COPY client client
COPY server server
RUN npm run build -w client

# ---------- runtime stage ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    ENABLE_TEST_API=true \
    CLIENT_DIST=/app/client/dist

COPY package.json tsconfig.base.json ./
COPY server/package.json server/
COPY --from=deps /app/node_modules node_modules
COPY --from=build /app/client/dist client/dist
COPY server/src server/src

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "--import", "tsx", "server/src/index.ts"]
