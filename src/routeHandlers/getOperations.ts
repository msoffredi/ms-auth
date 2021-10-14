import { Operation, OperationDoc } from '../models/operation';

// export const getOperationsHandler = async (): Promise<RouteHandlerResponse> => {
export const getOperationsHandler = async (): Promise<OperationDoc> => {
    return await Operation.scan().all().exec();
};
