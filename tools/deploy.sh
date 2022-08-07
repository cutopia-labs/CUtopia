sh tools/copy-env.sh

yarn --cwd mongodb/ run build
yarn --cwd lambda/graphql/ run build

if [ -f "samconfig.toml" ]; then
  sam deploy --stack-name $1 -t root-stack.yaml
else
  sam deploy --stack-name $1 -t root-stack.yaml --guided --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND
fi
