#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [ -d ".git" ]; then
  git pull --ff-only
fi
exec bash ./install.sh "$@"
