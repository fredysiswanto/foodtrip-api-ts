#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 /path/to/artifact.tar.gz [deploy-base]"
  exit 1
fi

ARTIFACT_PATH="$1"
DEPLOY_BASE="${2:-/home/ubuntu/foodtrip-api-ts}"
RELEASE_DIR="$DEPLOY_BASE/releases/$(date +'%Y%m%d-%H%M%S')"
CURRENT_LINK="$DEPLOY_BASE/current"
SHARED_DIR="$DEPLOY_BASE/shared"

mkdir -p "$RELEASE_DIR" "$SHARED_DIR" "$SHARED_DIR/logs" "$SHARED_DIR/public/uploads"

tar -xzf "$ARTIFACT_PATH" -C "$RELEASE_DIR"

if [ -f "$SHARED_DIR/.env" ]; then
  ln -sfn "$SHARED_DIR/.env" "$RELEASE_DIR/.env"
else
  echo "Warning: $SHARED_DIR/.env not found, continuing without shared .env file."
fi

if [ -d "$SHARED_DIR/public/uploads" ]; then
  mkdir -p "$RELEASE_DIR/public"
  rm -rf "$RELEASE_DIR/public/uploads"
  ln -sfn "$SHARED_DIR/public/uploads" "$RELEASE_DIR/public/uploads"
fi

cd "$RELEASE_DIR"
pnpm install --prod --frozen-lockfile

ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"
cd "$CURRENT_LINK"

pnpm prisma migrate deploy
if ! pm2 reload ecosystem.config.cjs --env production; then
  pm2 start ecosystem.config.cjs --env production
fi
