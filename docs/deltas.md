# 故意差异清单（非遗漏）

| 差异 | 原因 |
|------|------|
| MySQL → PostgreSQL | 方案已拍板 |
| Vue×3 → 单一 Next.js | 方案已拍板；mobile 并入响应式 |
| admin 独立用户表 → `users.role` | 统一鉴权 |
| MD5 密码 → bcrypt | 安全升级；无历史数据或迁移时重哈希 |
| 本地 Express JWT Header → Auth.js cookie session | 适配 Next App Router |
| 私信在线 map 按 socket.id 误删 → 按 userId 清理 | 修复旧 bug |
| 投稿默认 `pending`，审核通过后上首页 | 对齐管理审核链路 |
| manager 独立页未做 | 能力并入投稿/消息/studio |