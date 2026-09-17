# syntax=docker/dockerfile:1

FROM node:24.15.0-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# next build 時のページデータ収集用（本番接続は不要）
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/build_dummy"
# robots.txt・sitemap.xml と静的ページの noindex はビルド時に確定する。
# 実行時の環境変数では切り替わらないため、既定を true にして渡し忘れを検索に載らない側へ倒す。
ARG BLOCK_SEARCH_INDEXING=true
ENV BLOCK_SEARCH_INDEXING=$BLOCK_SEARCH_INDEXING
RUN npm run build

# migrate deploy 専用（Prisma CLI と全依存を隔離して保持）
FROM base AS prisma
RUN apk add --no-cache libc6-compat
WORKDIR /prisma-cli
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
COPY scripts/prisma.docker.config.ts ./prisma.config.ts

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=prisma /prisma-cli /prisma-cli
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
