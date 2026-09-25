# MySQL → PostgreSQL 数据迁移

旧栈在 `vidhub-master`，且默认**不纳入本仓库**。若本地仍有 MySQL `video` 库需要迁入：

1. 导出旧表 CSV / SQL
2. 字段映射见 `packages/db/src/schema/index.ts`（注意密码需重哈希为 bcrypt，或清空后让用户重置）
3. 运行 `pnpm db:migrate` 后手工导入 / 写一次性脚本

**首版默认空库上线**：执行

```sh
docker compose up -d postgres
pnpm db:migrate
pnpm db:seed-admin
```

默认管理员：`admin` / `admin123`（可用 `SEED_ADMIN_ACCOUNT` / `SEED_ADMIN_PASSWORD` 覆盖）。
