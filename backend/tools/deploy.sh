#!/bin/bash

if [ -z "${NODE_ENV:-}" ]; then
  echo "Set NODE_ENV to development or production before deploying" >&2
  exit 1
fi

bash tools/copy-data.sh
yarn --cwd mongodb/ run build
yarn --cwd lambda/graphql/ run build

bash tools/copy-env.sh
bash tools/copy-file.sh

if [ -f "samconfig.toml" ]; then
  sam deploy --stack-name $1 -t root-stack.yaml
else
  sam deploy --stack-name $1 -t root-stack.yaml --guided --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND
fi
