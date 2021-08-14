npm run --prefix lambda/graphql predeploy
eval "sam deploy --stack-name $1 -t root-stack.yaml"
npm run --prefix lambda/graphql postdeploy
