FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/web/package.json apps/web/
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/
COPY apps/realtime/package.json apps/realtime/
COPY apps/media/package.json apps/media/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app ./
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=postgresql://vidhub:vidhub@localhost:5432/vidhub
ENV AUTH_SECRET=build-time-placeholder-secret-32c
RUN pnpm --filter @vidhub/web build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app ./
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["pnpm", "start"]