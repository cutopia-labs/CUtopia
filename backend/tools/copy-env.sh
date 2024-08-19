#!/bin/bash

set -a
source ./.env
set +a

NODE_ENV=${NODE_ENV:-development}
if [[ "$NODE_ENV" == "production" ]]; then
  URI=${ATLAS_PROD_URI:-$ATLAS_URI}
else
  URI=${ATLAS_DEV_URI:-$ATLAS_URI}
fi

env_content=$(grep -vE '^(NODE_ENV|ATLAS_URI)=' ./.env)
env_content="${env_content}
NODE_ENV=\"${NODE_ENV}\"
ATLAS_URI=\"${URI}\""

declare -a modules=(
  "./lambda/emailer"
  "./lambda/graphql"
  "./lambda/cron-remove-timetable"
  "./lambda/cron-update-ranking"
)

for d in "${modules[@]}"; do
  printf "%s\n" "$env_content" > "$d/.env"
done
