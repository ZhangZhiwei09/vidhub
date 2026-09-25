# 故意差异清单（非遗漏）

| 差异 | 原因 |
|------|------|
| MySQL → PostgreSQL | 方案已拍板 |
| Vue×3 → 单一 Next.js | 方案已拍板；mobile 并入响应式 |
| admin 独立用户表 → `users.role` | 统一鉴权 |
| MD5 密码 → bcrypt | 安全升级；无历史数据或迁移时重哈希 |
| 本地 Express JWT Header → Auth.js cookie session | 适配 Next App Router |
| studio/channel/manager 首版未独立页面 | 核心互动已由关注/消息/投稿覆盖，见 parity dropped |
| 通知 inform 管理页延后 | notifications 表已建，API 可后续扩展 |