import dynamoose from 'dynamoose';
import { Document } from 'dynamoose/dist/Document';
import { localModelOptions, Serializers, SerializersOptions } from './_common';

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
    localModelOptions,
);

Role.serializer.add(
    Serializers.RemoveTimestamps,
    SerializersOptions[Serializers.RemoveTimestamps],
);

export { Role, RoleDoc };
