import { APIGatewayProxyEvent } from 'aws-lambda';
import jwt from 'jsonwebtoken';

import { ResponseBody } from '../handlers/types';
import { UnauthorizedError } from '../errors/unauthorized-error';
import { User } from '../models/user';
import { PermissionDoc } from '../models/permission';
import { RouteHandler } from '../routeHandlers/types';
import { Serializers } from '../models/_common';
import { RoleDoc } from '../models/role';

export interface AuthPermission {
    operationId: string;
    moduleId: string;
}

export const routeAuthorizer = async (
    event: APIGatewayProxyEvent,
    routeHandler: RouteHandler,
    validPermissions: AuthPermission[] = [],
): Promise<ResponseBody> => {
    if (!event.headers.Authorization) {
        throw new UnauthorizedError();
    }

    try {
        const [, token] = event.headers.Authorization.split(' ');

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
            const populatedUser = await user.serialize(
                Serializers.PopulateAndRemoveTimestamps,
            );

            let authorized = false;

            populatedUser.roles.forEach((role: RoleDoc) => {
                role.permissions.forEach((perm: PermissionDoc) => {
                    validPermissions.forEach((vperm) => {
                        if (
                            vperm.moduleId === perm.module.id &&
                            vperm.operationId === perm.operation.id
                        ) {
                            authorized = true;
                        }
                    });
                });
            });

            if (!authorized) {
                throw new Error(
                    'Authenticated user has insufficient permissions',
                );
            }
        }
    } catch (err) {
        console.error(err);
        throw new UnauthorizedError();
    }

    return await routeHandler(event);
};
