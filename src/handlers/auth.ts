import dynamoose from 'dynamoose';
import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { exit } from 'process';
import { getOperationsHandler } from '../routeHandlers/getOperations';
import { ResponseBody, ServiceStatus } from './types';
import { postOperationsHandler } from '../routeHandlers/postOperations';

if (process.env.AWS_SAM_LOCAL) {
    if (process.env.DYNAMODB_URI) {
        dynamoose.aws.ddb.local(process.env.DYNAMODB_URI);
    } else {
        console.error('No local DynamoDB URL provided');
        exit(1);
    }
}

export const handler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    // All log statements are written to CloudWatch
    console.debug('Received event:', event);

    let status = 200;
    let body: ResponseBody = null;

    try {
        switch (event.resource) {
            case '/v0/operations':
                if (event.httpMethod === 'GET') {
                    body = await getOperationsHandler();
                }
                if (event.httpMethod === 'POST') {
                    body = await postOperationsHandler(event);
                }
                break;

            case '/healthcheck':
                body = { serviceStatus: ServiceStatus.Healthy };
                break;

            default:
                status = 404;
                body = { message: 'Bad request' };
        }
    } catch (err) {
        console.error(err);
        status = 500;
        body = { message: 'Unexpected error' };
    }

    return {
        statusCode: status,
        body: JSON.stringify(body),
    };
};
