import {
    modelOptions,
    Serializers,
    SerializersOptions,
} from '@jmsoffredi/ms-common';
import dynamoose from 'dynamoose';
import { Document } from 'dynamoose/dist/Document';

interface OperationDoc extends Document {
    id: string;
    name: string;
}

const operationSchema = new dynamoose.Schema(
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

const Operation = dynamoose.model<OperationDoc>(
    'ms-auth-operations',
    operationSchema,
    modelOptions,
);

Operation.serializer.add(
    Serializers.RemoveTimestamps,
    SerializersOptions[Serializers.RemoveTimestamps],
);

export { Operation, OperationDoc };
