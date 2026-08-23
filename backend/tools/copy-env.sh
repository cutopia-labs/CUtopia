#!/bin/bash

requested_node_env="${NODE_ENV:-development}"

set -a
source ./.env
set +a

case "$requested_node_env" in
  dev | development)
    NODE_ENV=development
    atlas_uri="$ATLAS_DEV_URI"
    ;;
  prod | production)
    NODE_ENV=production
    atlas_uri="$ATLAS_PROD_URI"
    ;;
  *)
    echo "NODE_ENV must be development or production" >&2
    exit 1
    ;;
esac

if [ -z "$atlas_uri" ]; then
  echo "Missing Atlas URI for NODE_ENV=$NODE_ENV" >&2
  exit 1
fi

# Preserve function-specific secrets while replacing environment selectors with
# the explicitly requested deployment target.
env_content=$(grep -vE '^(NODE_ENV|ATLAS_URI)=' ./.env)
env_content="${env_content}
NODE_ENV=\"${NODE_ENV}\"
ATLAS_URI=\"${atlas_uri}\""

declare -a modules=(
  "./lambda/emailer"
  "./lambda/graphql"
  "./lambda/cron-remove-timetable"
  "./lambda/cron-update-ranking"
)

for d in "${modules[@]}"; do
  printf "%s\n" "$env_content" > "$d/.env"
done
