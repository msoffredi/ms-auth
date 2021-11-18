import { APIGatewayProxyEvent } from 'aws-lambda';
import {
    BadRequestError,
    DatabaseError,
    DeleteRecordResponseBody,
    RequestValidationError,
    RouteHandler,
} from '@jmsoffredi/ms-common';
import { Role } from '../models/role';
import { User } from '../models/user';

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
        const users = await User.scan({
            roles: { contains: id },
        }).exec();

        if (!users || !users.length) {
            await Role.delete(id);
        } else {
            throw new DatabaseError(
                `Can not delete role with id: ${id} because it has user(s) linked to it`,
            );
        }
    } else {
        // throw new DatabaseError(`Could not delete role with id: ${id}`);
        throw new BadRequestError();
    }

    return {
        deleted: id,
    };
};
