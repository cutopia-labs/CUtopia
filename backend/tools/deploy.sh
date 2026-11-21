#!/bin/bash

set -e

if [ "${NODE_ENV:-}" != "staging" ] && [ "${NODE_ENV:-}" != "production" ]; then
  echo "Set NODE_ENV to staging or production before deploying" >&2
  exit 1
fi

bash tools/copy-data.sh
yarn --cwd mongodb/ run build
yarn --cwd lambda/graphql/ run build

# Refresh local file dependencies from this build before SAM packages them.
for target in lambda/graphql/build lambda/emailer lambda/cron-remove-timetable lambda/cron-update-ranking; do
  mkdir -p "$target/node_modules/mongodb"
  rsync -a --delete mongodb/lib/ "$target/node_modules/mongodb/"
  (cd "$target" && node -e "require('./node_modules/mongodb')")
done

bash tools/copy-env.sh
bash tools/copy-file.sh

if [ -f "samconfig.toml" ]; then
  sam deploy --stack-name $1 -t root-stack.yaml
else
  sam deploy --stack-name $1 -t root-stack.yaml --guided --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND
fi
