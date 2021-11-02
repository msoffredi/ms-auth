# RBAC serverless microservice with AWS, NodeJS, TypeScript

This is an opensource microservice done in TypeScript and using AWS SAM. This application is a full authorization solution that leverages AWS API Gateway, Lambda Functions, and DynamoDB for a full serverless solution that will charge you only for what you use.

The solution includes a SAM template that will spin up an AWS Cognito User Pool to serve as authentication for the API and all endpoints will be behind this auth service except for `/healthcheck`.

The application is 100% setup to spin up locally for development purposes (using Docker), and also implements a code-base DynamoDB mock module for testing purposes so you don't need a local DB to run the tests.

## Solution Architecture

## AWS Services integrated

There are multiple AWS Services integrated into this project, and some indirect ones too. Here's a full list:

**Directly integrated services**

-   AWS Lambda
-   Amazon API Gateway
-   Amazon DynamoDB
-   Amazon CloudWatch

**PoC-related directly integrated services**

-   Amazon Cognito
-   Amazon EventBridge

**Indirectly integrated services**

-   AWS IAM
-   AWS CloudFormation
-   Amazon S3

## Dependencies

### Local (dev)

For a running local version of most of the solution (Amazon Cognito and Amazon Eventbridge do not have a local version)

-   [NodeJS](https://nodejs.dev/download/) (14.x or higher)
-   [Docker](https://docs.docker.com/get-docker/) (Docker Desktop recommended) to have a local DynamoDB
-   [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) + [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) to be able to start a local API
-   An [AWS](https://aws.amazon.com/) account (if you plan to use Cognito to login)

### Dev (cloud)

For a development full instance of the entire solution in AWS (in the cloud) you will need:

-   A [GitHub](https://github.com/) account for your repository
-   An [AWS](https://aws.amazon.com/) account

## Deployment

### Deploying to AWS Dev Account from local

Warning: local deployment to AWS is discouraged in favor of our CI/CD configuration. This is meant for CI/CD development and/or testing purposes and required an AWS account with almost admin privileges.

By dev here we mean deploying into an actual AWS account used for development purposes. In order to do that you basically need to build your project and deploy it by using the SAM CLI.

Before trying the next command make sure you have your AWS CLI installed and configured properly with a user with enough permissions to performe the deploy:

```bash
$ sam build
```

To deploy from local you will need a couple of things:

-   **A valid email address**: this is the super admin user email address the system will use to create the first user in your deployed Cognito User Pool to you have an initial access to the authorization system. This email address will be used also by the deployment script to create an initial user, role, and permissions for the user to have full access to the authorization service API.

-   **A unique Cognito domain name prefix**: this is in order for AWS to create a unique URL for you to access the Cognito UI. You can read more about this in the AWS (documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-assign-domain.html). The URL will then look like: `https://<prefix>.auth.<your-region>.amazoncognito.com`

And then deploy using the SAM CLI too:

```bash
$ sam deploy --guided
```

You are going to be prompted into answering a series of questions which will simplify the deployment command for you. Here's an example:

```
Looking for config file [samconfig.toml] :  Not found

Setting default arguments for 'sam deploy'
=========================================
Stack Name [sam-app]: ms-auth
AWS Region [us-east-1]:
Parameter SuperAdminEmail []: <Enter a real email address here>
Parameter AuthDomainName []: <Your unique Cognito domain name prefix>
#Shows you resources changes to be deployed and require a 'Y' to initiate deploy
Confirm changes before deploy [y/N]:
#SAM needs permission to be able to create roles to connect to the resources in your template
Allow SAM CLI IAM role creation [Y/n]:
Save arguments to configuration file [Y/n]:
SAM configuration file [samconfig.toml]:
SAM configuration environment [default]:
```

This command above should create all the necessary resources including CloudFormation stack and S3 deployment bucket. **Some of these resources will be created with unique randomly generated names and will persist even after a full cleanup (see cleanup command below)**.

By the default, if you followed the answers above, CloudFormation will save your answers and remember them for the next run in a file `samconfig.toml`. This file is ignored by default and won't be pushed into the GitHub repo (**and it shouldn't!**).

### Deploying to AWS using the GitHub CI/CD

A normal deployment to AWS using the project's CI/CD configuration will happen if you create and promote changes through a new branch (typically out of `main` branch), and create a Pull Request (PR) to merge your branch changes into `main`.

When the PR is ready to be merged into `main` and you trigger the action GitHub will run the project's GitHub actions including a full deploy to AWS.

For the above deployment to be successful, you need more configuration to be in place in your GitHub repository. That will include having the required secrets configured as stated in the next sub-section.

#### Adding secrets to your GitHub repository

In order for the AWS deployment GitHub action to work you need to add some secrets to your GitHub repository. These are the secrets and what to include in them:

-   `AWS_REGION` = Your prefered region, e.g. us-east-1
-   `AWS_ACCESS_KEY_ID` = A valid AWS account user access key (must have enough privileges to deploy the stack)
-   `AWS_SECRET_ACCESS_KEY` = A matching secret access key for the same user above
-   `SUPER_ADMIN_EMAIL` = The email address of the super admin added as first user to the user pool
-   `DEPLOY_S3_BUCKET` = An S3 bucket name to use for deployment purposes (this must be unique in the entire AWS)
-   `AUTH_DOMAIN_NAME` = Prefix for AWS Cognito to use for its UI (this must be unique in the entire AWS)

I recommend you take note of all of these configurations in a personal document or similar because you won't have access to these values in the future. The ones you want to be careful about are `AWS_ACCESS_KEY_ID` & `AWS_DECRET_ACCESS_KEY` (for these please follow AWS best practices in handling them and saving them for later. I save them in AWS Secret Manager).

### Removing everything from AWS at once

If at any point you want to actually remove the entire solution from AWS, you can run this command in your command line (with AWS CLI):

```
$ aws cloudformation delete-stack --stack-name ms-auth
```

This will ask AWS Cloudformation to use the template.yml and your current account deployment to select and remove all related configurations and services. Be advice this may take a few mins to complete even if you see the command finishing right away.

### AWS associated costs

This project stack can stay mostly within the AWS free tier, therefore, not produce any fix recurrent costs associated to the infrastructure deployed.

However, traffic obviously will consume from a different separate cost centers and eventually may produce some costs for you under your AWS account.

Anyways, from a development point ov view we are not currently incurring in any costs associated to this project and we have it permanently deployed in AWS.
