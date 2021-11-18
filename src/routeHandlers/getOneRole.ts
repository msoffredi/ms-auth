import { APIGatewayProxyEvent } from 'aws-lambda';
import {
    DatabaseError,
    RequestValidationError,
    RouteHandler,
} from '@jmsoffredi/ms-common';
import { Role, RoleDoc } from '../models/role';
import { Serializers } from '../models/_common';

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
