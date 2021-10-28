import { APIGatewayProxyEvent } from 'aws-lambda';
import { DatabaseError } from '../errors/database-error';
import { RequestValidationError } from '../errors/request-validation-error';
import { DeleteRecordResponseBody } from '../handlers/types';
import { Operation } from '../models/operation';
import { RouteHandler } from './types';

export const delOperationHandler: RouteHandler = async (
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

    const operation = await Operation.get(id);

    if (operation) {
        // TODO: should not allow deleting if the operation is in a permission

        await Operation.delete(id);
    } else {
        throw new DatabaseError(`Could not delete operation with id: ${id}`);
    }

    return {
        deleted: id,
    };
};
