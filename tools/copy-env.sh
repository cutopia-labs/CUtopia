set -a
source ./.env
set +a

NODE_ENV=${NODE_ENV:-development}
[[ "$NODE_ENV" == "production" ]] && URI=$ATLAS_PROD_URI || URI=$ATLAS_DEV_URI
env="\
NODE_ENV=${NODE_ENV}
ATLAS_URI=${URI}\
"

declare -a modules=(
  "./lambda/emailer"
  "./lambda/graphql"
  "./lambda/cron-remove-timetable"
  "./lambda/cron-update-ranking"
)

for d in "${modules[@]}"; do
  echo "$env" > $d/.env
done
