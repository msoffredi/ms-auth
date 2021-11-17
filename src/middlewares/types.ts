import { APIGatewayProxyEvent } from 'aws-lambda';

export interface CustomAPIGatewayProxyEvent extends APIGatewayProxyEvent {
    currentUser?: string;
}
