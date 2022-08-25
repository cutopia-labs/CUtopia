trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

yarn nodemon --watch "mongodb/src" \
        -e ts \
        --exec "tsc --project mongodb && yarn --cwd lambda/graphql upgrade mongodb" & \
yarn --cwd lambda/graphql nodemon --watch "src/schemas/*.graphql" \
        -e graphql \
        --ignore "src/schemas/bundle.graphql" \
        --exec "yarn run build-schema && yarn run build-gql-types"
