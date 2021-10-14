import { APIGatewayProxyEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { Operation, OperationDoc } from '../models/operation';
import { Serializers } from '../models/_common';

export const postOperationsHandler = async (
    event: APIGatewayProxyEvent,
): Promise<OperationDoc> => {
    if (!event.body) {
        throw new Error('You need to provide a name to add a new operation');
    }

    const request = JSON.parse(event.body);

    if (!request.name) {
        throw new Error('You need to provide a name to add a new operation');
    }

    const newOperation = await Operation.create({
        id: randomUUID(),
        name: request.name,
    });

    return new Operation(newOperation.serialize(Serializers.RemoveTimestamps));
};
