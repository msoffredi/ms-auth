import { APIGatewayProxyEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';
import {
    RequestValidationError,
    RouteHandler,
    Serializers,
} from '@jmsoffredi/ms-common';
import { Module, ModuleDoc } from '../models/module';

export const postModuleHandler: RouteHandler = async (
    event: APIGatewayProxyEvent,
): Promise<ModuleDoc> => {
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

    const newModule = await Module.create({
        id,
        name: request.name,
    });

    return new Module(newModule.serialize(Serializers.RemoveTimestamps));
};
