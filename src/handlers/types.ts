import { APIGatewayProxyEvent } from 'aws-lambda';
import { Document } from 'dynamoose/dist/Document';
import { ObjectType } from 'dynamoose/dist/General';
import { ErrorEntry } from '../errors/types';
import { UserDoc } from '../models/user';

export interface APIGatewayExtendedEvent extends APIGatewayProxyEvent {
    currentUser?: UserDoc;
}

interface ErrorResponseBody {
    message: string;
}

export enum ServiceStatus {
    Healthy = 'healthy',
}

export interface HealthcheckResponseBody {
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
