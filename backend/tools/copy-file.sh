#!/bin/bash

cd lambda/graphql
cp src/jwt/jwtRS256.key build/jwt
cp src/jwt/jwtRS256.key.pub build/jwt
cp src/schemas/bundle.graphql build/schemas
cp .env build/.env
cp -R src/data build
