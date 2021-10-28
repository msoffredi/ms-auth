import { APIGatewayProxyEvent } from 'aws-lambda';
import { DatabaseError } from '../errors/database-error';
import { RequestValidationError } from '../errors/request-validation-error';
import { Role, RoleDoc } from '../models/role';
import { Serializers } from '../models/_common';
import { RouteHandler } from './types';

export const getOneRoleHandler: RouteHandler = async (
    event: APIGatewayProxyEvent,
): Promise<RoleDoc> => {
    if (!event.pathParameters || !event.pathParameters.id) {
        throw new RequestValidationError([
            {
                message: 'Id missing in URL or invalid',
                field: 'id',
            },
        ]);
    }

    const { id } = event.pathParameters;

    const role = await Role.get(id);

    if (!role) {
        throw new DatabaseError(`Could not retrieve role with id: ${id}`);
    }

    return new Role(await role.serialize(Serializers.RemoveTimestamps));
};
