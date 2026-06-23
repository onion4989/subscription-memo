#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  (cd /prisma-cli && node ./node_modules/prisma/build/index.js migrate deploy)
fi

exec "$@"
