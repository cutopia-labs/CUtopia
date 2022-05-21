yarn --cwd mongodb/ run predeploy
yarn --cwd lambda/graphql/ run predeploy
sam deploy --stack-name $1 -t root-stack.yaml
yarn --cwd mongodb/ run postdeploy
yarn --cwd lambda/graphql/ run postdeploy
