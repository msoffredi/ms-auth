import { APIGatewayProxyEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { Module, ModuleDoc } from '../models/module';
import { Serializers } from '../models/_common';

export const postModulesHandler = async (
    event: APIGatewayProxyEvent,
): Promise<ModuleDoc> => {
    if (!event.body) {
        throw new Error('You need to provide a name to add a new operation');
    }

    const request = JSON.parse(event.body);

    if (!request.name) {
        throw new Error('You need to provide a name to add a new module');
    }

    const id = request.id ?? randomUUID();

    const newModule = await Module.create({
        id,
        name: request.name,
    });

    return new Module(newModule.serialize(Serializers.RemoveTimestamps));
};
