# VidHub

视频分享站点重构版：Next.js + PostgreSQL（自托管 Docker）。

旧实现 `vidhub-master/` 仅作对照，**不纳入本仓库 git**。

## 开发

```sh
cp .env.example .env
pnpm install
docker compose up -d postgres
pnpm db:migrate
pnpm dev
```

## 结构

- `apps/web` — Next.js（用户端 + `/admin`）
- `apps/realtime` — Socket.IO（弹幕 / 私信）
- `apps/media` — node-media-server（RTMP / HTTP-FLV）
- `packages/db` — Drizzle schema
- `packages/shared` — 共享类型与 zod 校验
