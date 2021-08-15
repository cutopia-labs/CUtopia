yarn --cwd lambda/graphql run predeploy
eval "sam deploy --stack-name $1 -t root-stack.yaml"
yarn --cwd lambda/graphql run postdeploy
