import {
    modelOptions,
    Serializers,
    SerializersOptions,
} from '@jmsoffredi/ms-common';
import dynamoose from 'dynamoose';
import { Document } from 'dynamoose/dist/Document';

interface PermissionDoc extends Document {
    id: string;
    name: string;
    moduleId: string;
    operationId: string;
}

const permissionSchema = new dynamoose.Schema(
    {
        id: {
            type: String,
            hashKey: true,
        },
        name: String,
        moduleId: String,
        operationId: String,
    },
    {
        timestamps: true,
    },
);

const Permission = dynamoose.model<PermissionDoc>(
    'ms-auth-permissions',
    permissionSchema,
    modelOptions,
);

Permission.serializer.add(
    Serializers.RemoveTimestamps,
    SerializersOptions[Serializers.RemoveTimestamps],
);

export { Permission, PermissionDoc };
