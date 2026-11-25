#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "[agy-skins] Node.js 22+ is required." >&2
  exit 1
fi
if [ ! -d "node_modules/esbuild" ]; then
  npm install --no-audit --no-fund
fi
node scripts/install.mjs "$@"
