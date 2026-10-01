#!/bin/sh
set -e
echo "[wame] applying database schema…"
npx drizzle-kit push --force --config=docker/drizzle.config.ts
echo "[wame] starting server on port ${PORT:-3000}"
exec npm run start -- -H 0.0.0.0 -p "${PORT:-3000}"
