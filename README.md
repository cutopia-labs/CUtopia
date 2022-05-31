## Initialization
### Install packages
- [Node.js](https://nodejs.org/en/)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#debian-stable)
- [Docker](https://www.docker.com/)
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

### Install node modules
```sh
sh tools/install-package.sh
```

### Create environment files
After running the command below, remember to replace all **ATLAS_URI** in the .env files with your MongoDB connection URI.

```sh
sh tools/create-env.sh
```

### Generate RSA key pair
The key pair is used for JWT login token encryption and saved in lambda/graphql/src/jwt.
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
http://localhost:4000/graphql.


## Deployment

### Create MongoDB Atlas instance
Create a [serverless MongoDB Atlas](https://www.mongodb.com/pricing) instance in Singapore region on AWS. Then, create an admin account and add a whitelisted IP address 0.0.0.0/0 in [MongoDB Cloud](https://cloud.mongodb.com/). Next, obtain your connection URI in MongoDB Cloud.

> Note: since serverless MongoDB Atlas does not support [Private Endpoints](https://www.mongodb.com/docs/atlas/security-private-endpoint/) or [VPC Peering](https://www.mongodb.com/docs/atlas/security-vpc-peering/) currently, the database connection is established using public IP address and password authentication. This method will be deprecated, once Private Endpoints or VPC Peering is supported.

### Configure AWS credientals
Generate your AWS access key as instructed [here](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys). Then run the command below, paste the generated key and set the "Default region name" to "ap-southeast-1", which is Singapore.

```sh
aws configure
```

### Deploy to AWS
All serivces under the directory lambda (e.g. GraphQL server) will be deployed to [Lambda](https://aws.amazon.com/lambda/) using the script below. You may find the status of your deployed stack in [CloudFormation](https://aws.amazon.com/cloudformation/) console.

```sh
sh tools/deploy.sh cutopia-dev
```

> Note: when you run the script for the first time, a few questions about deployment config will be asked in console. Follow the default values for all settings, except setting the "GraphQL may not have authorization defined, Is this okay? [y/N]" to "y".

Once the server is successfully deployed, open the [API Gateway](https://aws.amazon.com/api-gateway/) console and find the API ID of your server. Then, the GraphQL playground is available at https://{API ID}.execute-api.ap-southeast-1.amazonaws.com/Stage/graphql.

### Logs
All messages logged (e.g. using console.log in GraphQL) can be found in [CloudWatch](https://aws.amazon.com/cloudwatch/). To view the messages, click "Log groups" in the sidebar, then click the desired log group (e.g. /aws/lambda/cutopia-dev-Lambda-{ID}-GraphQL-{ID}).

## Test
### Server load test
This tool exams the time taken to handle enormous requests during peak period. The settings are: 50 users concurrently login their accounts, then fetch latest reviews and reviews of a course.

It is expected that the time taken will be much lesser when running the script for the second time, because most Lambda instances are warmed up.

```sh
cd tools/load-test/
node .
```

### MongoDB unit tests
To guarantee the functionality of database API, please run the Jest tests if the MongoDB controllers/models are modified.

```sh
yarn --cwd mongodb test --runInBand
```
