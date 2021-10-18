import dynamoose from 'dynamoose';
import { Document } from 'dynamoose/dist/Document';
import { Module, ModuleDoc } from './module';
import { Operation, OperationDoc } from './operation';
import { localModelOptions, Serializers, SerializersOptions } from './_common';

interface PermissionDoc extends Document {
    id: string;
    name: string;
    module: ModuleDoc;
    operation: OperationDoc;
}

const permissionSchema = new dynamoose.Schema(
    {
        id: {
            type: String,
            hashKey: true,
        },
        name: String,
        module: Module,
        operation: Operation,
    },
    {
        timestamps: true,
    },
);

const Permission = dynamoose.model<PermissionDoc>(
    'ms-auth-permissions',
    permissionSchema,
    localModelOptions,
);

Permission.serializer.add(
    Serializers.RemoveTimestamps,
    SerializersOptions[Serializers.RemoveTimestamps],
);

Permission.serializer.add(
    Serializers.PopulateAndRemoveTimestamps,
    SerializersOptions[Serializers.PopulateAndRemoveTimestamps],
);

export { Permission, PermissionDoc };
