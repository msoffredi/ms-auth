import { Operation, OperationDoc } from '../models/operation';
import { Serializers } from '../models/_common';

export const getOperationsHandler = async (): Promise<OperationDoc> => {
    return Operation.serializeMany(
        await Operation.scan().all().exec(),
        Serializers.RemoveTimestamps,
    );
};
