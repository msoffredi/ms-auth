import {
    modelOptions,
    Serializers,
    SerializersOptions,
} from '@jmsoffredi/ms-common';
import dynamoose from 'dynamoose';
import { Document } from 'dynamoose/dist/Document';
import { PermissionDoc } from './permission';

interface UserDoc extends Document {
    id: string;
    roles: string[];
    permissions?: PermissionDoc[];
}

const userSchema = new dynamoose.Schema(
    {
        id: {
            type: String,
            hashKey: true,
        },
        roles: {
            type: Array,
            schema: [String],
        },
    },
    {
        timestamps: true,
    },
);
const User = dynamoose.model<UserDoc>(
    'ms-auth-users',
    userSchema,
    modelOptions,
);

User.serializer.add(
    Serializers.RemoveTimestamps,
    SerializersOptions[Serializers.RemoveTimestamps],
);

export { User, UserDoc };
