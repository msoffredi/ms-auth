import { APIGatewayProxyEvent } from 'aws-lambda';
import { DeleteRecordResponseBody } from '../handlers/types';
import { Operation } from '../models/operation';

export const delOperationHandler = async (
    event: APIGatewayProxyEvent,
): Promise<DeleteRecordResponseBody> => {
    if (!event.pathParameters || !event.pathParameters.id) {
        throw new Error(
            'You need to provide the id of the operation you want to delete',
        );
    }

    await Operation.delete(event.pathParameters.id);

    return {
        deleted: event.pathParameters.id,
    };
};
