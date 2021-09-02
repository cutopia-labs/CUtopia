NODE_ENV=production # to install non-dev dependencies only

yarn --cwd mongodb/ run build
yarn --cwd lambda/graphql/ run build
eval "sam deploy --stack-name $1 -t root-stack.yaml"
yarn --cwd mongodb/ run postdeploy
yarn --cwd lambda/graphql/ run postdeploy
