import dynamoose from 'dynamoose';
import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { exit } from 'process';
import { getOperationsHandler } from '../routeHandlers/getOperations';
import { ResponseBody, ServiceStatus } from './types';
import { postOperationHandler } from '../routeHandlers/postOperation';
import { delOperationHandler } from '../routeHandlers/delOperation';
import { getModulesHandler } from '../routeHandlers/getModules';
import { postModuleHandler } from '../routeHandlers/postModule';
import { delModuleHandler } from '../routeHandlers/delModule';
import { CustomError } from '../errors/custom-error';
import { getPermissionsHandler } from '../routeHandlers/getPermissions';
import { BadMethodError } from '../errors/bad-method-error';
import { BadRequestError } from '../errors/bad-request-error';
import { postPermissionHandler } from '../routeHandlers/postPermission';
import { delPermissionHandler } from '../routeHandlers/delPermission';
import { getOnePermissionHandler } from '../routeHandlers/getOnePermission';
import { getRolesHandler } from '../routeHandlers/getRoles';
import { postRoleHandler } from '../routeHandlers/postRole';
import { delRoleHandler } from '../routeHandlers/delRole';
import { getOneRoleHandler } from '../routeHandlers/getOneRole';
import { getUsersHandler } from '../routeHandlers/getUsers';
import { postUserHandler } from '../routeHandlers/postUser';
import { getOneUserHandler } from '../routeHandlers/getOneUser';
import { delUserHandler } from '../routeHandlers/delUser';

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
            case '/v0/users/{id}':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await getOneUserHandler(event);
                        break;
                    case 'DELETE':
                        body = await delUserHandler(event);
                        break;
                    default:
                        throw new BadMethodError();
                }
                break;

            case '/v0/users':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await getUsersHandler();
                        break;
                    case 'POST':
                        body = await postUserHandler(event);
                        break;
                    default:
                        throw new BadMethodError();
                }
                break;

            case '/v0/permissions':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await getPermissionsHandler();
                        break;
                    case 'POST':
                        body = await postPermissionHandler(event);
                        break;
                    default:
                        throw new BadMethodError();
                }
                break;

            case '/v0/roles':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await getRolesHandler();
                        break;
                    case 'POST':
                        body = await postRoleHandler(event);
                        break;
                    default:
                        throw new BadMethodError();
                }
                break;

            case '/v0/roles/{id}':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await getOneRoleHandler(event);
                        break;
                    case 'DELETE':
                        body = await delRoleHandler(event);
                        break;
                    default:
                        throw new BadMethodError();
                }
                break;

            case '/v0/permissions/{id}':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await getOnePermissionHandler(event);
                        break;
                    case 'DELETE':
                        body = await delPermissionHandler(event);
                        break;
                    default:
                        throw new BadMethodError();
                }
                break;

            case '/healthcheck':
                if (event.httpMethod === 'GET') {
                    body = { serviceStatus: ServiceStatus.Healthy };
                } else {
                    throw new BadMethodError();
                }
                break;

            case '/v0/operations':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await getOperationsHandler();
                        break;
                    case 'POST':
                        body = await postOperationHandler(event);
                        break;
                    default:
                        throw new BadMethodError();
                }
                break;

            case '/v0/modules':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await getModulesHandler();
                        break;
                    case 'POST':
                        body = await postModuleHandler(event);
                        break;
                    default:
                        throw new BadMethodError();
                }
                break;

            case '/v0/modules/{id}':
                if (event.httpMethod === 'DELETE') {
                    body = await delModuleHandler(event);
                } else {
                    throw new BadMethodError();
                }
                break;

            case '/v0/operations/{id}':
                if (event.httpMethod === 'DELETE') {
                    body = await delOperationHandler(event);
                } else {
                    throw new BadMethodError();
                }
                break;

            default:
                // We should never reach this point if the API Gateway is configured properly
                throw new BadRequestError();
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
