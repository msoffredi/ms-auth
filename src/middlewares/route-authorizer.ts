import jwt from 'jsonwebtoken';

import { APIGatewayExtendedEvent, ResponseBody } from '../handlers/types';
import { UnauthorizedError } from '../errors/unauthorized-error';
import { User } from '../models/user';
import { Permission } from '../models/permission';
import { RouteHandler } from '../routeHandlers/types';
import { Role } from '../models/role';

export interface AuthPermission {
    operationId: string;
    moduleId: string;
}

export const routeAuthorizer = async (
    event: APIGatewayExtendedEvent,
    routeHandler: RouteHandler,
    validPermissions: AuthPermission[] = [],
    allowOwnRead = false,
): Promise<ResponseBody> => {
    if (!event.headers.Authorization) {
        throw new UnauthorizedError();
    }

    try {
        const [, token] = event.headers.Authorization.split(' ');

        // Cognito token payload example
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
        //     email: 'msoffredi@gmail.com'
        // }
        const decodedToken = jwt.decode(token);

        if (
            !decodedToken ||
            typeof decodedToken !== 'object' ||
            !decodedToken.email
        ) {
            throw new Error(
                'Provided token does not have a valid format, or does not include e valid email property',
            );
        }

        const user = await User.get(decodedToken.email);

        if (!user) {
            throw new Error('User does not exist');
        }

        // Validate user's permissions
        if (validPermissions.length) {
            let authorized = false;

            for (const roleId of user.roles) {
                const role = await Role.get(roleId);

                if (!role) {
                    throw new Error('Invalid or inexistent role id');
                }

                for (const permissionId of role.permissions) {
                    const perm = await Permission.get(permissionId);

                    if (!perm) {
                        throw new Error('Invalid or inexistent permission id');
                    }

                    validPermissions.forEach((vperm) => {
                        if (
                            vperm.moduleId === perm.moduleId &&
                            vperm.operationId === perm.operationId
                        ) {
                            authorized = true;
                        }
                    });
                }
            }

            if (!authorized) {
                if (
                    !allowOwnRead ||
                    !event.pathParameters ||
                    !event.pathParameters.id ||
                    event.pathParameters.id !== user.id
                ) {
                    throw new Error(
                        'Authenticated user has insufficient permissions',
                    );
                } else if (
                    event.pathParameters &&
                    event.pathParameters.id &&
                    event.pathParameters.id === user.id
                ) {
                    event.currentUser = user;
                }
            }
        }
    } catch (err) {
        console.error(err);
        throw new UnauthorizedError();
    }

    return routeHandler(event);
};
