# #!/usr/bin/env bash
set -euo pipefail

export NVM_DIR="$HOME/.nvm"

if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
fi

export PATH="$HOME/.local/share/pnpm:$PATH"

ARTIFACT_PATH="$1"
DEPLOY_BASE="${2:-/home/ubuntu/foodtrip-api-ts}"

RELEASE_DIR="$DEPLOY_BASE/releases/$(date +'%Y%m%d-%H%M%S')"
CURRENT_LINK="$DEPLOY_BASE/current"
SHARED_DIR="$DEPLOY_BASE/shared"

mkdir -p "$RELEASE_DIR"
mkdir -p "$SHARED_DIR/logs"
mkdir -p "$SHARED_DIR/public/uploads"

tar -xzf "$ARTIFACT_PATH" -C "$RELEASE_DIR"

ln -sfn "$SHARED_DIR/.env" "$RELEASE_DIR/.env"

cd "$RELEASE_DIR"

pnpm install --prod --frozen-lockfile --ignore-scripts

pnpm exec prisma generate

pnpm prisma migrate deploy

ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

cd "$CURRENT_LINK"

if pm2 describe foodtrip-api-ts >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --env production
else
  pm2 start ecosystem.config.cjs --env production
fi

pm2 save

# keep last 5 releases
ls -dt "$DEPLOY_BASE"/releases/* \
  | tail -n +3 \
  | xargs rm -rf || true