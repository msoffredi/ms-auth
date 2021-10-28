import dynamoose from 'dynamoose';
import { Document } from 'dynamoose/dist/Document';
import { localModelOptions, Serializers, SerializersOptions } from './_common';

interface UserDoc extends Document {
    id: string;
    roles: string[];
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
    localModelOptions,
);

User.serializer.add(
    Serializers.RemoveTimestamps,
    SerializersOptions[Serializers.RemoveTimestamps],
);

export { User, UserDoc };
