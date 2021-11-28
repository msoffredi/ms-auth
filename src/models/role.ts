import {
    modelOptions,
    Serializers,
    SerializersOptions,
} from '@jmsoffredi/ms-common';
import dynamoose from 'dynamoose';
import { Document } from 'dynamoose/dist/Document';

interface RoleDoc extends Document {
    id: string;
    name: string;
    permissions: string[];
}

const roleSchema = new dynamoose.Schema(
    {
        id: {
            type: String,
            hashKey: true,
        },
        name: String,
        // Should be an array of permission IDs (strings)
        permissions: {
            type: Array,
            schema: [String],
        },
    },
    {
        timestamps: true,
    },
);
const Role = dynamoose.model<RoleDoc>(
    'ms-auth-roles',
    roleSchema,
    modelOptions,
);

Role.serializer.add(
    Serializers.RemoveTimestamps,
    SerializersOptions[Serializers.RemoveTimestamps],
);

export { Role, RoleDoc };
