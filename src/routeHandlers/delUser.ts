import { APIGatewayProxyEvent } from 'aws-lambda';
import {
    DatabaseError,
    RequestValidationError,
    DeleteRecordResponseBody,
    RouteHandler,
} from '@jmsoffredi/ms-common';
import { publisher } from '../events/event-publisher';
import { AuthEventDetailTypes } from '../events/types';
import { User } from '../models/user';

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

    // Publish authorization.user.deleted event
    await publisher(AuthEventDetailTypes.AuthUserDeleted, {
        userId: id,
    });

    return {
        deleted: id,
    };
};
