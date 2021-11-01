import { APIGatewayProxyEvent } from 'aws-lambda';
import { BadRequestError } from '../errors/bad-request-error';
import { DatabaseError } from '../errors/database-error';
import { RequestValidationError } from '../errors/request-validation-error';
import { DeleteRecordResponseBody } from '../handlers/types';
import { Module } from '../models/module';
import { Permission } from '../models/permission';
import { RouteHandler } from './types';

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
