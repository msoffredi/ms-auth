import jwt from 'jsonwebtoken';
import { ResponseBody } from '../handlers/types';
import { UnauthorizedError } from '../errors/unauthorized-error';
import { RouteHandler } from '../routeHandlers/types';
import { CustomAPIGatewayProxyEvent } from './types';

export interface AuthPermission {
    operationId: string;
    moduleId: string;
}

export const routeAuthorizer = async (
    event: CustomAPIGatewayProxyEvent,
    routeHandler: RouteHandler,
    validPermissions: AuthPermission[] = [],
    allowOwnRead = false,
): Promise<ResponseBody> => {
    if (!event.headers.Authorization) {
        throw new UnauthorizedError();
    }

    try {
        const [, token] = event.headers.Authorization.split(' ');

        // Cognito identity token payload example
        // {
        //     at_hash: 'HabHtPvngfWyNShbQi1Kfg',
        //     sub: 'c31e153a-6691-4106-b6d5-609b48f5a13e',
        //     aud: '309jr91j85ib1dd296k4cbpemg',
        //     token_use: 'id',
        //     auth_time: 1634994921,
        //     iss: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_yzn16CPQI',
        //     'cognito:username': 'c31e153a-6691-4106-b6d5-609b48f5a13e',
        //     exp: 1634998521,
        //     iat: 1634994921,
        //     jti: 'c11b46a4-095d-407d-8261-2d3c881066f0',
        //     email: 'msoffredi@gmail.com',
        //     userPermissions: '[["moduleId","operationId"]]'
        // }
        const decodedToken = jwt.decode(token);

        if (
            !decodedToken ||
            typeof decodedToken !== 'object' ||
            !decodedToken.email ||
            !decodedToken.userPermissions
        ) {
            throw new Error(
                'Provided token does not have a valid format, or does not include required properties',
            );
        }

        const { email, userPermissions } = decodedToken;

        // Validate user's permissions
        if (validPermissions.length) {
            let authorized = false;

            for (const [moduleId, operationId] of JSON.parse(userPermissions)) {
                validPermissions.forEach((vperm) => {
                    if (
                        (moduleId === '*' || vperm.moduleId === moduleId) &&
                        (operationId === '*' ||
                            vperm.operationId === operationId)
                    ) {
                        authorized = true;
                    }
                });
            }

            if (!authorized) {
                if (
                    !allowOwnRead ||
                    !event.pathParameters ||
                    !event.pathParameters.id ||
                    event.pathParameters.id !== email
                ) {
                    throw new Error(
                        'Authenticated user has insufficient permissions',
                    );
                } else if (
                    event.pathParameters &&
                    event.pathParameters.id &&
                    event.pathParameters.id === email
                ) {
                    event.currentUser = email;
                }
            }
        }
    } catch (err) {
        console.error(err);
        throw new UnauthorizedError();
    }

    return routeHandler(event);
};
