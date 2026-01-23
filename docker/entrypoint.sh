#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set" >&2
  exit 1
fi

npx prisma migrate deploy

if [ "$SEED_ON_START" = "1" ] || [ "$SEED_ON_START" = "true" ]; then
  npx prisma db seed
fi

exec npm run start
