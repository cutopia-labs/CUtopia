# CUtopia Backend

## Packages

Install [MongoDB](https://www.mongodb.com/try/download/community) and [MongoDB Compass](https://www.mongodb.com/try/download/compass) to manage the database.

## Deployment

### Create MongoDB Atlas instance
Create a [serverless MongoDB Atlas](https://www.mongodb.com/pricing) instance in Singapore region on AWS. Then, create an admin account and add a whitelisted IP address 0.0.0.0/0 in [MongoDB Cloud](https://cloud.mongodb.com/). Next, obtain your connection URI in MongoDB Cloud.

### Configure AWS CLI
Install [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and generate your AWS access key as instructed [here](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys). Then run the script below, paste the generated key and set the "Default region name" to "ap-southeast-1", which is Singapore.

```bash
aws configure
```

### Deploy to AWS
All serverless serivces will be deployed to [Lambda](https://aws.amazon.com/lambda/) using the script below. The status of deployed stacks can be found in [CloudFormation](https://aws.amazon.com/cloudformation/).

```bash
# Deploy development stack
export NODE_ENV=development; bash tools/deploy.sh cutopia-dev

# Deploy production stack
export NODE_ENV=production; bash tools/deploy.sh cutopia-production
```

> Note: when running the script for the first time, a few config options will be asked in console. Follow the default values for all options.

### Logs
All messages logged (e.g. using console.log in GraphQL server) can be found in [CloudWatch](https://aws.amazon.com/cloudwatch/).

## Test
### Server load test
This tool exams the time taken to handle enormous requests during peak period. The settings are: 50 users concurrently login their accounts, then fetch latest reviews and reviews of a course.

```sh
cd tools/load-test/
node .
```

### MongoDB unit tests
To guarantee the functionality of database API, please run the Jest tests if the MongoDB controllers/models are modified.

```sh
cd ../
yarn test backend/ --runInBand
```
