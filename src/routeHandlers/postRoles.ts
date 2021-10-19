import { APIGatewayProxyEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { DatabaseError } from '../errors/database-error';
import { RequestValidationError } from '../errors/request-validation-error';
import { Permission, PermissionDoc } from '../models/permission';
import { Role, RoleDoc } from '../models/role';
import { Serializers } from '../models/_common';

export const postRolesHandler = async (
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
    }

    if (errors.length) {
        throw new RequestValidationError(errors);
    }

    // Validate permissions and prepare them for the INSERT
    const permDocs: PermissionDoc[] = [];
    for (const perm of permissions) {
        const permDoc = await Permission.get(perm.id);
        if (!permDoc) {
            throw new DatabaseError(
                `Permissions with id ${perm.id} was not found.`,
            );
        }
        permDocs.push(permDoc);
    }

    const id = request.id ?? randomUUID();
    const newRole = await Role.create({
        id,
        name: request.name,
        permissions: permDocs,
    });

    // return await newRole.serialize(Serializers.PopulateAndRemoveTimestamps);
    return new Role(
        await newRole.serialize(Serializers.PopulateAndRemoveTimestamps),
    );
};
