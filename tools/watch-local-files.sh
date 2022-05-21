yarn --cwd mongodb/ run build
yarn --cwd lambda/graphql run build

trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

tsc --project lambda/graphql -w & \
  nodemon --watch "mongodb/src" -e ts --exec "tsc --project mongodb/ && yarn --cwd lambda/graphql/ run upgrade-db" & \
  nodemon --watch "lambda/graphql/src/schemas/*.graphql" -e graphql --ignore "lambda/graphql/src/schemas/bundle.graphql" --exec "yarn --cwd lambda/graphql/ run local-gql"
