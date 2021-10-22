# RBAC serverless microservice with AWS, NodeJS, TypeScript

This is an opensource microservice done in TypeScript and using AWS SAM. This application is a full authorization solution that leverages AWS API Gateway, Lambda Functions, and DynamoDB for a full serverless solution that will charge you only for what you use.

The solution includes a SAM template that will spin up an AWS Cognito User Pool to serve as authentication for the API and all endpoints will be behind this auth service except for `/healthcheck`.

The application is 100% setup to spin up locally for development purposes (using Docker), and also implements a code-base DynamoDB mock module for testing purposes so you don't need a local DB to run the tests.

## Dependencies

### Dev / Local

-

### Production

-

## Dev deployment

### Adding secrets to your GitHub repository

In order for the GitHub action to work you need to add some secrets to your GitHub repository. These are the secrets and what to include in them:

-   `AWS_REGION` = Your prefered region, e.g. us-east-1
-   `AWS_ACCESS_KEY_ID` = A valid AWS account user access key (must have enough privileges to deploy the stack)
-   `AWS_SECRET_ACCESS_KEY` = A matching secret access key for the same user above
-   `SUPER_ADMIN_EMAIL` = The email address of the super admin added as first user to the user pool
-   `DEPLOY_S3_BUCKET` = An S3 bucket name to use for deployment purposes
-   `AUTH_DOMAIN_NAME` = Prefix for AWS Cognito to use for its UI
