#!/bin/sh
set -e
cd /app
pnpm --filter @vidhub/db migrate
if [ "${SEED_DEMO:-1}" = "1" ]; then
  pnpm --filter @vidhub/db seed:demo
fi
cd /app/apps/web
exec pnpm start
