import { APIGatewayProxyEvent } from 'aws-lambda';
import { DeleteRecordResponseBody } from '../handlers/types';
import { Module } from '../models/module';

export const delModuleHandler = async (
    event: APIGatewayProxyEvent,
): Promise<DeleteRecordResponseBody> => {
    if (!event.pathParameters || !event.pathParameters.id) {
        throw new Error(
            'You need to provide the id of the module you want to delete',
        );
    }

    await Module.delete(event.pathParameters.id);

    return {
        deleted: event.pathParameters.id,
    };
};
