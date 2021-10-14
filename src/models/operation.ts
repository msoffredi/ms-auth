import dynamoose from 'dynamoose';
import { Document } from 'dynamoose/dist/Document';
import { localModelOptions } from './_common';

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
    localModelOptions,
);

export { Operation, OperationDoc };
