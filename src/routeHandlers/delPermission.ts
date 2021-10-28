import { APIGatewayProxyEvent } from 'aws-lambda';
import { DatabaseError } from '../errors/database-error';
import { RequestValidationError } from '../errors/request-validation-error';
import { DeleteRecordResponseBody } from '../handlers/types';
import { Permission } from '../models/permission';
import { RouteHandler } from './types';

export const delPermissionHandler: RouteHandler = async (
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

    const permission = await Permission.get(id);

    if (permission) {
        // TODO: should not allow deleting if the permission is in a role

        await Permission.delete(id);
    } else {
        throw new DatabaseError(`Could not delete permission with id: ${id}`);
    }

    return {
        deleted: id,
    };
};
