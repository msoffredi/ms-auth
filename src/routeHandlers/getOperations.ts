import { Operation, OperationDoc } from '../models/operation';
import { Serializers } from '../models/_common';
import { RouteHandler } from './types';

export const getOperationsHandler: RouteHandler =
    async (): Promise<OperationDoc> => {
        return Operation.serializeMany(
            await Operation.scan().all().exec(),
            Serializers.RemoveTimestamps,
        );
    };
