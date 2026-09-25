# 能力对等矩阵

从旧仓 `vidhub-master` 机械枚举。状态：`todo` / `doing` / `done` / `dropped`（须写原因）。

## 用户端页面

| 旧路径/视图 | 新路径 | 状态 | 备注 |
|-------------|--------|------|------|
| home | `/` | doing | 骨架 |
| login | `/login` | done | Auth.js |
| detail | `/video/[id]` | todo | |
| popular | `/popular` | todo | |
| result (search) | `/search` | todo | |
| upload | `/upload` | todo | 占位页 |
| studio/* | `/studio/*` | todo | |
| channel | `/channel/[uid]` | todo | |
| message/* | `/message/*` | todo | |
| live/list | `/live` | todo | 占位页 |
| live/room | `/live/[id]` | todo | |
| manager | `/manager` | todo | |
| mobile 独立应用 | — | dropped | 合并为响应式 |

## 管理端页面

| 旧视图 | 新路径 | 状态 |
|--------|--------|------|
| login | `/login`（role=admin） | done |
| dashboard | `/admin` | doing |
| video | `/admin/videos` | todo |
| user | `/admin/users` | todo |
| comment | `/admin/comments` | todo |
| danmuku | `/admin/danmakus` | todo |
| inform | `/admin/informs` | todo |
| auth/check | `/admin/reviews` | todo |

## HTTP API（旧 Express）

| 旧路由域 | 新实现 | 状态 |
|----------|--------|------|
| `/login` `/register` | Auth.js + server actions | done |
| `/admin/login` | 同上 + role | done |
| video/* | Route Handlers | todo |
| upload/* | Route Handlers | todo |
| comments/* | Route Handlers | todo |
| danmaku/* | Route Handlers | todo |
| archive/like/collect | Route Handlers | todo |
| users/follow/* | Route Handlers | todo |
| message/chat/* | Route Handlers | todo |
| live/* | Route Handlers | todo |
| admin/* CRUD | `/admin` + APIs | todo |

## Socket 事件

| 事件 | 服务 | 状态 |
|------|------|------|
| join / joinRoom / leaveRoom | apps/realtime | done |
| sendDanmaku → msg | apps/realtime | done |
| sendMessage → msg | apps/realtime | done（修了旧断线 map 清理） |

## 数据表

| 旧表 | 新表 | 状态 |
|------|------|------|
| users | users | done |
| admin | users.role=admin | done（合并） |
| videos | videos | done |
| video_mapping | video_mappings | done |
| archive | archives | done |
| comments | comments | done |
| danmakus | danmakus | done |
| follow | follows | done |
| live | lives | done |
| chat | chats | done |
| user_notifications / admin_notifications | notifications | done（合并） |

## 故意差异

见 [deltas.md](./deltas.md)。
