#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <release-name> [deploy-base]"
  exit 1
fi

TARGET_RELEASE="$1"
DEPLOY_BASE="${2:-/home/ubuntu/foodtrip-api-ts}"
TARGET_DIR="$DEPLOY_BASE/releases/$TARGET_RELEASE"
CURRENT_LINK="$DEPLOY_BASE/current"

if [ ! -d "$TARGET_DIR" ]; then
  echo "Release not found: $TARGET_DIR"
  exit 1
fi

ln -sfn "$TARGET_DIR" "$CURRENT_LINK"
cd "$CURRENT_LINK"
pm2 reload ecosystem.config.cjs --env production

echo "Rolled back to $TARGET_RELEASE"
