import dynamoose from 'dynamoose';
import { Document } from 'dynamoose/dist/Document';
import { localModelOptions, Serializers, SerializersOptions } from './_common';

interface ModuleDoc extends Document {
    id: string;
    name: string;
}

const moduleSchema = new dynamoose.Schema(
    {
        id: {
            type: String,
            hashKey: true,
        },
        name: String,
    },
    {
        timestamps: true,
    },
);

const Module = dynamoose.model<ModuleDoc>(
    'ms-auth-modules',
    moduleSchema,
    localModelOptions,
);

Module.serializer.add(
    Serializers.RemoveTimestamps,
    SerializersOptions[Serializers.RemoveTimestamps],
);

export { Module, ModuleDoc };
