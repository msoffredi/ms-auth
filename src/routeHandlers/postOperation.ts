import { APIGatewayProxyEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { RequestValidationError } from '../errors/request-validation-error';
import { Operation, OperationDoc } from '../models/operation';
import { Serializers } from '../models/_common';

export const postOperationHandler = async (
    event: APIGatewayProxyEvent,
): Promise<OperationDoc> => {
    if (!event.body) {
        throw new RequestValidationError([
            {
                message: 'Name field missing in provided body',
                field: 'name',
            },
        ]);
    }

    const request = JSON.parse(event.body);

    if (!request.name) {
        throw new RequestValidationError([
            {
                message: 'Name field missing in provided body',
                field: 'name',
            },
        ]);
    }

    const id = request.id ?? randomUUID();

    const newOperation = await Operation.create({
        id,
        name: request.name,
    });

    return new Operation(newOperation.serialize(Serializers.RemoveTimestamps));
};
