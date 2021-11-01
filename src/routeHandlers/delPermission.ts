import { APIGatewayProxyEvent } from 'aws-lambda';
import { BadRequestError } from '../errors/bad-request-error';
import { DatabaseError } from '../errors/database-error';
import { RequestValidationError } from '../errors/request-validation-error';
import { DeleteRecordResponseBody } from '../handlers/types';
import { Permission } from '../models/permission';
import { Role } from '../models/role';
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
        const roles = await Role.scan({
            permissions: { contains: id },
        }).exec();

        if (!roles || !roles.length) {
            await Permission.delete(id);
        } else {
            throw new DatabaseError(
                `Can not delete permission with id: ${id} because it has role(s) linked to it`,
            );
        }
    } else {
        throw new BadRequestError();
    }

    return {
        deleted: id,
    };
};
