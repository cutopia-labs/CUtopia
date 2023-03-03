#!/bin/bash

# Step 1: copy data from git submodule to GraphQL server
bash tools/copy-data.sh

# Step 2: install node modules
bash tools/install-package.sh

# Step 3: build schema and GraphQL types
yarn --cwd lambda/graphql build-schema
yarn --cwd lambda/graphql build-gql-types

# Step 4: create environment variables
# Shared env
if [ ! -f ".env" ]
then
    echo "\
    ATLAS_PROD_URI=\"Your MongoDB connection key for production\"
    ATLAS_DEV_URI=\"mongodb://localhost:27017/?readPreference=primary&appname=CUtopia-local&directConnection=true&ssl=false\"
    ATLAS_JEST_URI=\"Your MongoDB connection key for running Jest scripts (note: data is removed during testing)\"\
    " > .env
else
    echo ".env exists, skipped initialization."
fi

# Emailer env
# This env file can be ignored if you are not developing emailer
# Currently, it is assumed three email addresses are available for resending emails in case of failure
if [ ! -f "lambda/emailer/.emailer.env" ]
then
    echo "\
    GMAIL_ADDRESS_0=Your email address
    GMAIL_CLIENT_ID_0=Your client id
    GMAIL_CLIENT_SECRET_0=Your client secret
    GMAIL_REFRESH_TOKEN_0=Your refresh token
    GMAIL_ACCESS_TOKEN_0=Your access token

    GMAIL_ADDRESS_1=Your email address
    GMAIL_CLIENT_ID_1=Your client id
    GMAIL_CLIENT_SECRET_1=Your client secret
    GMAIL_REFRESH_TOKEN_1=Your refresh token
    GMAIL_ACCESS_TOKEN_1=Your access token

    GMAIL_ADDRESS_2=Your email address
    GMAIL_CLIENT_ID_2=Your client id
    GMAIL_CLIENT_SECRET_2=Your client secret
    GMAIL_REFRESH_TOKEN_2=Your refresh token
    GMAIL_ACCESS_TOKEN_2=Your access token\
    " > lambda/emailer/.emailer.env
else
    echo "lambda/emailer/.emailer.env exists, skipped initialization."
fi

# Env of Lambda load test
if [ ! -f "tools/load-test/.env" ]
then
    echo "\
    GRAPHQL_ENDPOINT=https://{API Gateway ID}.{region}.amazonaws.com/Stage/graphql
    AUTH_USERNAME=username of a CUtopia account
    AUTH_PASSWORD=password of a CUtopia account\
    " > tools/load-test/.env
else
    echo "tools/load-test/.env exists, skipped initialization."
fi

# Step 5: generate RSA key pair
# Reference: https://gist.github.com/ygotthilf/baa58da5c3dd1f69fae9
if [ ! -f "lambda/graphql/src/jwt/jwtRS256.key" ]
then
    mkdir -p "lambda/graphql/src/jwt"
    publicKeyPath="lambda/graphql/src/jwt/jwtRS256.key.pub"
    privateKeyPath="lambda/graphql/src/jwt/jwtRS256.key"

    ssh-keygen -t rsa -b 4096 -m PEM -f $privateKeyPath -N ""
    openssl rsa -in $privateKeyPath -pubout -outform PEM -out $publicKeyPath
else
    echo "lambda/graphql/src/jwt/jwtRS256.key exists, skipped initialization."
fi
