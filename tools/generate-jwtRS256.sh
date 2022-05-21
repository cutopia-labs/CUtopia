# https://gist.github.com/ygotthilf/baa58da5c3dd1f69fae9

mkdir "lambda/graphql/src/jwt"
publicKeyPath="lambda/graphql/src/jwt/jwtRS256.key.pub"
privateKeyPath="lambda/graphql/src/jwt/jwtRS256.key"

ssh-keygen -t rsa -b 4096 -m PEM -f $privateKeyPath
# Don't add passphrase
openssl rsa -in $privateKeyPath -pubout -outform PEM -out $publicKeyPath
cat $publicKeyPath
cat $privateKeyPath
