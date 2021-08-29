yarn --cwd lambda/graphql run predeploy
eval "sam deploy --stack-name $1 --no-confirm-changeset -t root-stack.yaml"
yarn --cwd lambda/graphql run postdeploy
