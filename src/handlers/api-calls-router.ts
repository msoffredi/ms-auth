import { APIGatewayProxyEvent } from 'aws-lambda';
import { getOperationsHandler } from '../routeHandlers/getOperations';
import { ResponseBody, ServiceStatus, HandlerResponse } from './types';
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
import { routeAuthorizer } from '../middlewares/route-authorizer';
import { Config } from '../config';

export const apiCallsRouter = async (
    event: APIGatewayProxyEvent,
): Promise<HandlerResponse> => {
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
                    body = { serviceStatus: ServiceStatus.Healthy };
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

    return { status, body };
};
