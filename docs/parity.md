# 能力对等矩阵

从旧仓 `vidhub-master` 机械枚举。状态：`todo` / `doing` / `done` / `dropped`（须写原因）。

## 用户端页面

| 旧路径/视图 | 新路径 | 状态 | 备注 |
|-------------|--------|------|------|
| home | `/` | done | 视频列表 |
| login | `/login` | done | Auth.js |
| detail | `/video/[id]` | done | 评论/赞藏/弹幕 |
| popular | `/popular` | done | |
| result (search) | `/search` | done | |
| upload | `/upload` | done | 分片上传 |
| studio/* | `/studio/*` | done | works/collect/following/fans |
| channel | `/channel/[uid]/*` | done | |
| message/* | `/message` `/message/[peerId]` | done | |
| notifications | `/notifications` | done | |
| live/list | `/live` | done | |
| live/room | `/live/[id]` | done | FLV |
| manager | — | dropped | 并入投稿/消息 |
| mobile 独立应用 | — | dropped | 合并为响应式 |

## 管理端页面

| 旧视图 | 新路径 | 状态 |
|--------|--------|------|
| login | `/login`（role=admin） | done |
| dashboard | `/admin` | done |
| video | `/admin/videos` | done |
| user | `/admin/users` | done |
| comment | `/admin/comments` | done |
| danmuku | `/admin/danmakus` | done |
| inform | `/notifications` | done | 用户通知；管理端 inform 页仍可后续加 |
| auth/check | `/admin/videos?status=pending` | done | 审核合并进视频管理 |

## HTTP API（旧 Express）

| 旧路由域 | 新实现 | 状态 |
|----------|--------|------|
| `/login` `/register` | Auth.js + server actions | done |
| `/admin/login` | 同上 + role | done |
| video/* | Route Handlers + RSC | done |
| upload/* | Route Handlers | done |
| comments/* | Route Handlers | done |
| danmaku/* | Route Handlers | done |
| archive/like/collect | Route Handlers | done |
| users/follow/* | Route Handlers | done |
| message/chat/* | Route Handlers | done |
| live/* | Route Handlers | done |
| admin/* CRUD | `/api/admin` | done |

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
| user_notifications / admin_notifications | notifications | done（合并，API 后续可扩展） |

## 故意差异

见 [deltas.md](./deltas.md)。
