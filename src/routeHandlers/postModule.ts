import { APIGatewayProxyEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { RequestValidationError } from '../errors/request-validation-error';
import { Module, ModuleDoc } from '../models/module';
import { Serializers } from '../models/_common';
import { RouteHandler } from './types';

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
