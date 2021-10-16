import { APIGatewayProxyEvent } from 'aws-lambda';
import { Operation, OperationDoc } from '../models/operation';
import { Serializers } from '../models/_common';

export const getOperationHandler = async (
    event: APIGatewayProxyEvent,
): Promise<OperationDoc> => {
    if (!event.pathParameters || !event.pathParameters.id) {
        throw new Error(
            'You need to provide the id of the operation you want to retrieve',
        );
    }

    const operation = await Operation.get(event.pathParameters.id);

    return new Operation(operation.serialize(Serializers.RemoveTimestamps));
};
