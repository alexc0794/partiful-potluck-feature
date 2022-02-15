# partiful-potluck-backend

Express backend for Partiful Potluck feature

## Development

The project is written in TypeScript, so the .ts files need to be built into .js files, which are located in the /build folder.

```
// [Tab 1] Build local changes and run the Express API locally on port 8080
npm run dev

// [Tab 2] Run local DynamoDB on port 8000 (see DynamoDB section for more info)
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

See `package.json` for other scripts to run.

### HTTPS

The backend is run on https, so you must have `server.cert` and `server.key`. These should be generated locally and not made public, which is why they are in the .gitignore. To generate a self-signed certificate, go to the root folder and run:

```
openssl req -nodes -new -x509 -keyout server.key -out server.cert
```

### LocalStack

Install [LocalStack](https://github.com/localstack/localstack). Also install the [AWS CLI](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Tools.CLI.html) and Docker.

To run AWS services like DynamoDB and SNS locally, we need to run LocalStack inside a Docker container. Docker configuration is defined in `docker-compose.yml`, which was copied from [this article](https://dzone.com/articles/useful-tools-for-local-development-with-aws-servic). The Docker container running LocalStack can be started with the following command:

```
TMPDIR=/private$TMPDIR SERVICES=dynamodb,sns docker-compose up
```

Once the container is up and running, the AWS services are available at `http://localhost:4566`. Use [`AWSLocal`](https://github.com/localstack/awscli-local) to use the AWS CLI locally (it's a CLI that proxies the AWS CLI and adds `--endpoint-url http://localhost:4566` after every command).

#### DynamoDB

This repo has scripts to run to make starting up an environment quicker and easier. Create the necessary DynamoDB tables locally by adding the appropriate commands in `scripts/create_tables.ts` and `scripts/delete_tables.ts`.

```
// Create tables
npm run ddb

// Or more aggressively, delete tables and create new ones
npm run ddbr
```

#### SNS

SNS is used to implement event-fanout, enabling services & endpoints to scale and have fewer responsibilities.

## Deploying

This project is deployed using [serverless](https://dashboard.serverless.com/tenants/alexchou94/applications/). Deploying can be done by simply running `npm run deploy` command, which will build the project and deploy with the `serverless` CLI. This change should propogate to AWS. Configuration can be found in `serverless.yml`.
