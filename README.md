## Initialization
### Install packages
- [Nodejs](https://nodejs.org/en/)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#debian-stable)
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

### Install node modules
```sh
sh tools/install-package.sh
```

### Create envorinment files
```sh
sh tools/create-env.sh
```

### Generate RSA key pair
They key pair is used for JWT login token encryption.
```sh
sh tools/generate-jwtRS256.sh
```

## Development
### Compile scripts
```sh
sh tools/watch-local-files.sh
```
### Start server
Run below in another terminal after scripts are compiled:
```sh
sh tools/run-local-server.sh
```

### GraphQL playground
After server started, GraphQL playground is available at:
http://localhost:4000/graphql


## Deployment

### Configure AWS credientals
Generate your AWS access key as instructed [here](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys). Then run the command below and paste the generated key:

```sh
aws configure
```

### Deploy to AWS
```sh
sh tools/deploy.sh cutopia-dev
```

### Configure API Gateway manually for static resources
1. Create Resource
> /static
> 
> Enable API Gateway CORS: True

2. Create Child Resources for all files under static
> Configure as proxy resource: True
> 
> Resource Path `static_file_name_with_extension`
>
> Enable API Gateway CORS: True
3. Add Methods (e.g. GET, OPTION) for all files under child resources
> 
> Integration type: Lambda fn
> 
> Use Lambda Proxy Integration: true
4. Deploy API
> Choose stage of deployment (Prod)
