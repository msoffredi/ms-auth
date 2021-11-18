import { APIGatewayProxyEvent } from 'aws-lambda';
import {
    BadRequestError,
    DatabaseError,
    RequestValidationError,
    DeleteRecordResponseBody,
    RouteHandler,
} from '@jmsoffredi/ms-common';
import { Module } from '../models/module';
import { Permission } from '../models/permission';

export const delModuleHandler: RouteHandler = async (
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

    const module = await Module.get(id);

    if (module) {
        const permissions = await Permission.scan({
            moduleId: id,
        }).exec();

        if (!permissions || !permissions.length) {
            await Module.delete(id);
        } else {
            throw new DatabaseError(
                `Can not delete module with id: ${id} because it has permission(s) linked to it`,
            );
        }
    } else {
        throw new BadRequestError();
    }

    return {
        deleted: id,
    };
};
