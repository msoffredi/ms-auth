import { Operation, OperationDoc } from '../models/operation';
import { RouteHandler, Serializers } from '@jmsoffredi/ms-common';

export const getOperationsHandler: RouteHandler =
    async (): Promise<OperationDoc> => {
        return Operation.serializeMany(
            await Operation.scan().all().exec(),
            Serializers.RemoveTimestamps,
        );
    };
