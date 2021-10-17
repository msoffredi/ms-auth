import { APIGatewayProxyEvent } from 'aws-lambda';
import { DatabaseError } from '../errors/database-error';
import { RequestValidationError } from '../errors/request-validation-error';
import { DeleteRecordResponseBody } from '../handlers/types';
import { Module } from '../models/module';

export const delModuleHandler = async (
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
        // TODO: should not allow deleting if the module is in a permission

        await Module.delete(id);
    } else {
        throw new DatabaseError(`Could not delete module with id: ${id}`);
    }

    return {
        deleted: id,
    };
};
