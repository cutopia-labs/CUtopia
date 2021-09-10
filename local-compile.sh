yarn --cwd mongodb/ run build
yarn --cwd lambda/graphql run build

tsc --project lambda/graphql -w & \
  nodemon --watch "mongodb/src" -e ts --exec "tsc --project mongodb/ && yarn --cwd lambda/graphql/ run upgrade-db" & \
  nodemon --watch "lambda/graphql/src/schemas/*.graphql" -e graphql --exec "cd lambda/graphql && sh copyfile.sh" -q & \
