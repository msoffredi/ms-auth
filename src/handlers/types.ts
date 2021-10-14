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

export type ResponseBody =
    | OperationDoc
    | ErrorResponseBody
    | HealthcheckResponseBody
    | null;
