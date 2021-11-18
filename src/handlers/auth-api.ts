import dynamoose from 'dynamoose';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { exit } from 'process';
import {
    ResponseBody,
    CustomError,
    BadRequestError,
    BadMethodError,
    routeAuthorizer,
} from '@jmsoffredi/ms-common';
import { Config } from '../config';
import { delOperationHandler } from '../routeHandlers/delOperation';
import { delModuleHandler } from '../routeHandlers/delModule';
import { postModuleHandler } from '../routeHandlers/postModule';
import { getModulesHandler } from '../routeHandlers/getModules';
import { postOperationHandler } from '../routeHandlers/postOperation';
import { getOperationsHandler } from '../routeHandlers/getOperations';
import { healthcheckHandler } from '../routeHandlers/healthcheck';
import { delPermissionHandler } from '../routeHandlers/delPermission';
import { getOnePermissionHandler } from '../routeHandlers/getOnePermission';
import { delRoleHandler } from '../routeHandlers/delRole';
import { getOneRoleHandler } from '../routeHandlers/getOneRole';
import { postRoleHandler } from '../routeHandlers/postRole';
import { getRolesHandler } from '../routeHandlers/getRoles';
import { postPermissionHandler } from '../routeHandlers/postPermission';
import { getPermissionsHandler } from '../routeHandlers/getPermissions';
import { postUserHandler } from '../routeHandlers/postUser';
import { getUsersHandler } from '../routeHandlers/getUsers';
import { delUserHandler } from '../routeHandlers/delUser';
import { getOneUserHandler } from '../routeHandlers/getOneUser';

// Local configuration
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
    console.log('Received event:', event);

    const auth = Config.Authorization;
    let status = 200;
    let body: ResponseBody = null;

    try {
        switch (event.resource) {
            case '/v0/users/{id}':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await routeAuthorizer(
                            event,
                            getOneUserHandler,
                            [auth.Users.ReadUsers],
                            true,
                        );
                        break;
                    case 'DELETE':
                        body = await routeAuthorizer(event, delUserHandler, [
                            auth.Users.DeleteUser,
                        ]);
                        break;
                    default:
                        throw new BadMethodError();
                }
                break;

            case '/v0/users':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await routeAuthorizer(event, getUsersHandler, [
                            auth.Users.ReadUsers,
                        ]);
                        break;
                    case 'POST':
                        body = await routeAuthorizer(event, postUserHandler, [
                            auth.Users.AddUser,
                        ]);
                        break;
                    default:
                        throw new BadMethodError();
                }
                break;

            case '/v0/permissions':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await routeAuthorizer(
                            event,
                            getPermissionsHandler,
                            [auth.Permissions.ReadPermissions],
                        );
                        break;
                    case 'POST':
                        body = await routeAuthorizer(
                            event,
                            postPermissionHandler,
                            [auth.Permissions.AddPermission],
                        );
                        break;
                    default:
                        throw new BadMethodError();
                }
                break;

            case '/v0/roles':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await routeAuthorizer(event, getRolesHandler, [
                            auth.Roles.ReadRoles,
                        ]);
                        break;
                    case 'POST':
                        body = await routeAuthorizer(event, postRoleHandler, [
                            auth.Roles.AddRole,
                        ]);
                        break;
                    default:
                        throw new BadMethodError();
                }
                break;

            case '/v0/roles/{id}':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await routeAuthorizer(event, getOneRoleHandler, [
                            auth.Roles.ReadRoles,
                        ]);
                        break;
                    case 'DELETE':
                        body = await routeAuthorizer(event, delRoleHandler, [
                            auth.Roles.DeleteRole,
                        ]);
                        break;
                    default:
                        throw new BadMethodError();
                }
                break;

            case '/v0/permissions/{id}':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await routeAuthorizer(
                            event,
                            getOnePermissionHandler,
                            [auth.Permissions.ReadPermissions],
                        );
                        break;
                    case 'DELETE':
                        body = await routeAuthorizer(
                            event,
                            delPermissionHandler,
                            [auth.Permissions.DeletePermission],
                        );
                        break;
                    default:
                        throw new BadMethodError();
                }
                break;

            case '/healthcheck':
                if (event.httpMethod === 'GET') {
                    body = await healthcheckHandler(event);
                } else {
                    throw new BadMethodError();
                }
                break;

            case '/v0/operations':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await routeAuthorizer(
                            event,
                            getOperationsHandler,
                            [auth.Operations.ReadOperations],
                        );
                        break;
                    case 'POST':
                        body = await routeAuthorizer(
                            event,
                            postOperationHandler,
                            [auth.Operations.AddOperation],
                        );
                        break;
                    default:
                        throw new BadMethodError();
                }
                break;

            case '/v0/modules':
                switch (event.httpMethod) {
                    case 'GET':
                        body = await routeAuthorizer(event, getModulesHandler, [
                            auth.Modules.ReadModules,
                        ]);
                        break;
                    case 'POST':
                        body = await routeAuthorizer(event, postModuleHandler, [
                            auth.Modules.AddModule,
                        ]);
                        break;
                    default:
                        throw new BadMethodError();
                }
                break;

            case '/v0/modules/{id}':
                if (event.httpMethod === 'DELETE') {
                    body = await routeAuthorizer(event, delModuleHandler, [
                        auth.Modules.DeleteModule,
                    ]);
                } else {
                    throw new BadMethodError();
                }
                break;

            case '/v0/operations/{id}':
                if (event.httpMethod === 'DELETE') {
                    body = await routeAuthorizer(event, delOperationHandler, [
                        auth.Operations.DeleteOperation,
                    ]);
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
