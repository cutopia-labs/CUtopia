sh tools/copy-env.sh

yarn --cwd mongodb/ run predeploy
yarn --cwd lambda/graphql/ run predeploy
if [ -f "samconfig.toml" ]; then
  sam deploy --stack-name $1 -t root-stack.yaml
else
  sam deploy --stack-name $1 -t root-stack.yaml --guided --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND
fi
yarn --cwd mongodb/ run postdeploy
yarn --cwd lambda/graphql/ run postdeploy
