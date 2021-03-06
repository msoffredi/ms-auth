import { APIGatewayProxyEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';
import {
    RequestValidationError,
    RouteHandler,
    Serializers,
} from '@jmsoffredi/ms-common';
import { Permission } from '../models/permission';
import { Role, RoleDoc } from '../models/role';

export const postRoleHandler: RouteHandler = async (
    event: APIGatewayProxyEvent,
): Promise<RoleDoc> => {
    const errors = [];

    if (!event.body) {
        throw new RequestValidationError([
            {
                message:
                    'You need to provide a name, and an array of permissions to create a role',
            },
        ]);
    }

    const request = JSON.parse(event.body);

    if (!request.name) {
        errors.push({
            message: 'Name field missing in provided body',
            field: 'name',
        });
    }

    if (!request.permissions) {
        errors.push({
            message: 'Permissions array field missing in provided body',
            field: 'permissions',
        });
    }

    const { permissions } = request;
    if (!(permissions instanceof Array) || permissions.length === 0) {
        errors.push({
            message: 'Permissions array field invalid or empty',
            field: 'permissions',
        });
    } else {
        // Validate permissions and prepare them for the INSERT
        for (const perm of permissions) {
            const permDoc = await Permission.get(perm);
            if (!permDoc) {
                errors.push({
                    message: `Permission with id ${perm} was not found.`,
                    field: 'permissions',
                });
            }
        }
    }

    if (errors.length) {
        throw new RequestValidationError(errors);
    }

    const id = request.id ?? randomUUID();
    const newRole = await Role.create({
        id,
        name: request.name,
        permissions: permissions,
    });

    return new Role(await newRole.serialize(Serializers.RemoveTimestamps));
};
