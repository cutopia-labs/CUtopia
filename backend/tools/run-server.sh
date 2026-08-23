#!/bin/bash

NODE_ENV="${NODE_ENV:-development}"
if [ "$NODE_ENV" = "dev" ]; then
  NODE_ENV=development
fi
if [ "$NODE_ENV" = "prod" ]; then
  NODE_ENV=production
fi

export NODE_ENV
bash tools/copy-env.sh
yarn --cwd lambda/graphql nodemon src/local.ts
