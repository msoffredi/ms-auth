import dynamoose from 'dynamoose';
import { Document } from 'dynamoose/dist/Document';
import { Permission, PermissionDoc } from './permission';
import { localModelOptions, Serializers, SerializersOptions } from './_common';

interface RoleDoc extends Document {
    id: string;
    name: string;
    permissions: PermissionDoc[];
}

const roleSchema = new dynamoose.Schema(
    {
        id: {
            type: String,
            hashKey: true,
        },
        name: String,
        permissions: {
            type: Array,
            schema: [Permission],
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

Role.serializer.add(
    Serializers.PopulateAndRemoveTimestamps,
    SerializersOptions[Serializers.PopulateAndRemoveTimestamps],
);

export { Role, RoleDoc };
