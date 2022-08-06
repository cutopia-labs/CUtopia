# Common env
echo "\
ATLAS_PROD_URI=\"Your MongoDB connection key for production\"
ATLAS_DEV_URI=\"Your MongoDB connection key for development\"\
" > .env

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
GMAIL_ACCESS_TOKEN_2=Your access token\
" > lambda/emailer/.emailer.env

# Env of Lambda load test
echo "\
GRAPHQL_ENDPOINT=https://{API Gateway ID}.{region}.amazonaws.com/Stage/graphql
AUTH_USERNAME=username of a CUtopia account
AUTH_PASSWORD=password of a CUtopia account\
" > tools/load-test/.env
