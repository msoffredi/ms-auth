import dynamoose from 'dynamoose';
import _ from 'lodash';
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    EventBridgeEvent,
} from 'aws-lambda';
import { exit } from 'process';
import { MsAuthEvents, ResponseBody } from './types';
import { apiCallsRouter } from './api-calls-router';
import { AuthEventDetail, AuthEventsDetailTypes } from '../events/types';
import { eventsRouter } from './events-router';
import { Config } from '../config';
import { EventBusTypes } from '../config/types';

// Local configuration
if (process.env.AWS_SAM_LOCAL) {
    if (process.env.DYNAMODB_URI) {
        dynamoose.aws.ddb.local(process.env.DYNAMODB_URI);
    } else {
        console.error('No local DynamoDB URL provided');
        exit(1);
    }
}

export const handler = async (
    event?: MsAuthEvents<AuthEventsDetailTypes, AuthEventDetail>,
): Promise<APIGatewayProxyResult> => {
    console.log('Received event:', event);

    let status = 200;
    let body: ResponseBody = null;

    if (isAPIGatewayProxyEvent(event)) {
        const response = await apiCallsRouter(event as APIGatewayProxyEvent);
        status = response.status;
        body = response.body;
    } else if (isAuthEvent(event)) {
        const response = await eventsRouter(
            event as EventBridgeEvent<AuthEventsDetailTypes, AuthEventDetail>,
        );
        status = response.status;
        body = response.body;
    }

    return {
        statusCode: status,
        body: JSON.stringify(body),
    };
};

const isAuthEvent = (
    event?: MsAuthEvents<AuthEventsDetailTypes, AuthEventDetail>,
): boolean => {
    let validEvent = false;

    if (Config.events.eventBusType === EventBusTypes.AWSEventBridge) {
        validEvent = Boolean(
            event &&
                event.id &&
                event.version &&
                event.time &&
                event.resources &&
                event.source &&
                event['detail-type'] &&
                event.detail,
        );
    }

    return (
        validEvent &&
        _.get(event, Config.events.inputEvents.eventDataLocation) &&
        _.get(event, Config.events.inputEvents.eventTypeLocation)
    );
};

const isAPIGatewayProxyEvent = (
    event?: MsAuthEvents<AuthEventsDetailTypes, AuthEventDetail>,
): boolean => {
    return Boolean(
        event &&
            event.resource &&
            event.httpMethod &&
            (event.body || event.body === null) &&
            event.headers &&
            event.multiValueHeaders &&
            (event.isBase64Encoded || event.isBase64Encoded === false) &&
            (event.pathParameters || event.pathParameters === null) &&
            (event.queryStringParameters ||
                event.queryStringParameters === null) &&
            (event.multiValueQueryStringParameters ||
                event.multiValueQueryStringParameters === null) &&
            (event.stageVariables || event.stageVariables === null) &&
            event.requestContext,
    );
};
