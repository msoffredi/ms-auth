import {
    modelOptions,
    Serializers,
    SerializersOptions,
} from '@jmsoffredi/ms-common';
import dynamoose from 'dynamoose';
import { Document } from 'dynamoose/dist/Document';

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
    modelOptions,
);

Module.serializer.add(
    Serializers.RemoveTimestamps,
    SerializersOptions[Serializers.RemoveTimestamps],
);

export { Module, ModuleDoc };
