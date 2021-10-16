import dynamoose from 'dynamoose';
import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { exit } from 'process';
import { getOperationsHandler } from '../routeHandlers/getOperations';
import { ResponseBody, ServiceStatus } from './types';
import { postOperationsHandler } from '../routeHandlers/postOperations';
import { delOperationHandler } from '../routeHandlers/delOperation';
import { getModulesHandler } from '../routeHandlers/getModules';
import { postModulesHandler } from '../routeHandlers/postModules';
import { delModuleHandler } from '../routeHandlers/delModule';
import { CustomError } from '../errors/custom-error';

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
            case '/healthcheck':
                if (event.httpMethod === 'GET') {
                    body = { serviceStatus: ServiceStatus.Healthy };
                } else {
                    throw new Error('Unsupported method for this path');
                }
                break;

            case '/v0/operations':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await getOperationsHandler();
                        break;
                    case 'POST':
                        body = await postOperationsHandler(event);
                        break;
                    default:
                        throw new Error('Unsupported method for this path');
                }
                break;

            case '/v0/modules':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await getModulesHandler();
                        break;
                    case 'POST':
                        body = await postModulesHandler(event);
                        break;
                    default:
                        throw new Error('Unsupported method for this path');
                }
                break;

            case '/v0/modules/{id}':
                if (event.httpMethod === 'DELETE') {
                    body = await delModuleHandler(event);
                } else {
                    throw new Error('Unsupported method for this path');
                }
                break;

            case '/v0/operations/{id}':
                if (event.httpMethod === 'DELETE') {
                    body = await delOperationHandler(event);
                } else {
                    throw new Error('Unsupported method for this path');
                }
                break;

            default:
                console.log(event);
                status = 404;
                body = { message: 'Bad request' };
        }
    } catch (err) {
        console.error(err);

        if (err instanceof CustomError) {
            status = err.statusCode;
            body = err.serializeErrors();
        }
    }

    return {
        statusCode: status,
        body: JSON.stringify(body),
    };
};
