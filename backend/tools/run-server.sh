#!/bin/bash

NODE_ENV=dev; bash tools/copy-env.sh
yarn --cwd lambda/graphql nodemon src/local.ts
