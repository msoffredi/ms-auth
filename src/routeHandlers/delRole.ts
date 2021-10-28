import { APIGatewayProxyEvent } from 'aws-lambda';
import { DatabaseError } from '../errors/database-error';
import { RequestValidationError } from '../errors/request-validation-error';
import { DeleteRecordResponseBody } from '../handlers/types';
import { Role } from '../models/role';
import { RouteHandler } from './types';

export const delRoleHandler: RouteHandler = async (
    event: APIGatewayProxyEvent,
): Promise<DeleteRecordResponseBody> => {
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

    if (role) {
        // TODO: should not allow deleting if the role is assigned to a user

        await Role.delete(id);
    } else {
        throw new DatabaseError(`Could not delete role with id: ${id}`);
    }

    return {
        deleted: id,
    };
};
