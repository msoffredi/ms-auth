import dynamoose from 'dynamoose';
import { Document } from 'dynamoose/dist/Document';
import { RoleDoc, Role } from './role';
import { localModelOptions, Serializers, SerializersOptions } from './_common';

interface UserDoc extends Document {
    id: string;
    username: string;
    roles: RoleDoc[];
}

const userSchema = new dynamoose.Schema(
    {
        id: {
            type: String,
            hashKey: true,
        },
        username: {
            type: String,
            required: true,
        },
        roles: {
            type: Array,
            schema: [Role],
        },
    },
    {
        timestamps: true,
    },
);
const User = dynamoose.model<UserDoc>(
    'ms-auth-users',
    userSchema,
    localModelOptions,
);

User.serializer.add(
    Serializers.RemoveTimestamps,
    SerializersOptions[Serializers.RemoveTimestamps],
);

User.serializer.add(
    Serializers.PopulateAndRemoveTimestamps,
    SerializersOptions[Serializers.PopulateAndRemoveTimestamps],
);

export { User, UserDoc };
