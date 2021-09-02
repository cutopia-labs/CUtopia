yarn --cwd mongodb/ run build
yarn --cwd lambda/graphql run build

tsc --project mongodb/ -w & \
  tsc --project lambda/graphql/ -w & \
  nodemon --watch "mongodb/lib" --exec "yarn --cwd lambda/graphql/ run upgrade-db" -q & \
  nodemon --watch "lambda/graphql/src/schemas/*.graphql" -e graphql --exec "cd lambda/graphql && sh copyfile.sh" -q & \
  sam local start-api -t root-stack.yaml 2>local.log
