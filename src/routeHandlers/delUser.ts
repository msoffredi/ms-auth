import { APIGatewayProxyEvent } from 'aws-lambda';
import { DatabaseError } from '../errors/database-error';
import { RequestValidationError } from '../errors/request-validation-error';
import { DeleteRecordResponseBody } from '../handlers/types';
import { User } from '../models/user';
import { RouteHandler } from './types';

export const delUserHandler: RouteHandler = async (
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

    const user = await User.get(id);

    if (user) {
        await User.delete(id);
    } else {
        throw new DatabaseError(`Could not delete user with id: ${id}`);
    }

    return {
        deleted: id,
    };
};
