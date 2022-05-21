# MongoDB env
echo "\
ATLAS_URI=Your MongoDB connection key
ATLAS_DEV_URI=Your MongoDB connection key for running Jest test scripts\
" > mongodb/.env

# GraphQL env
echo "\
NODE_ENV=production
ATLAS_URI=Your MongoDB connection key\
" > lambda/graphql/.env

# Emailer env
# This env file can be ignored if you are not developing emailer
# Currently, it is assumed three email addresses are available for resending emails in case of failure
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
GMAIL_ACCESS_TOKEN_2=Your access token

ATLAS_URI=Your MongoDB connection key\
" > lambda/emailer/.env

# Env of cron scheduler of timetable removal 
echo "\
ATLAS_URI=Your MongoDB connection key\
" > lambda/cron-remove-timetable/.env

# Env of cron scheduler of ranking update
echo "\
ATLAS_URI=Your MongoDB connection key\
" > lambda/cron-update-ranking/.env

echo "\
GRAPHQL_ENDPOINT=https://{API Gateway ID}.{region}.amazonaws.com/Stage/graphql
AUTH_USERNAME=username of a CUtopia account
AUTH_PASSWORD=password of a CUtopia account\
" > tools/load-test/.env
