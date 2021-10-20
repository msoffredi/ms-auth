import { Document } from 'dynamoose/dist/Document';
import { ObjectType } from 'dynamoose/dist/General';
import { ErrorEntry } from '../errors/types';

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
    | Document
    | ObjectType[]
    | ErrorResponseBody
    | HealthcheckResponseBody
    | DeleteRecordResponseBody
    | ErrorEntry[]
    | null;
