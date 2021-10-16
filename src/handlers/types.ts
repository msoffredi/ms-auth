import { ErrorEntry } from '../errors/types';
import { OperationDoc } from '../models/operation';

interface ErrorResponseBody {
    message: string;
}

export enum ServiceStatus {
    Healthy = 'healthy',
}

interface HealthcheckResponseBody {
    serviceStatus: ServiceStatus;
}

export interface DeleteRecordResponseBody {
    deleted: string;
}

export type ResponseBody =
    | OperationDoc
    | ErrorResponseBody
    | HealthcheckResponseBody
    | DeleteRecordResponseBody
    | ErrorEntry[]
    | null;
