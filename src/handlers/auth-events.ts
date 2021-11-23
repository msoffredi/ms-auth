import dynamoose from 'dynamoose';
import { Callback, Context, EventBridgeEvent } from 'aws-lambda';
import _ from 'lodash';
import { exit } from 'process';
import { Config } from '../config';
import {
    CustomError,
    events,
    UserCreatedEventDataType,
    UserDeletedEventDataType,
} from '@jmsoffredi/ms-common';
import { userDeletedEventHandler } from '../events/user-deleted-event';
import { userCreatedEventHandler } from '../events/user-created-event';

if (process.env.AWS_SAM_LOCAL) {
    if (process.env.DYNAMODB_URI) {
        dynamoose.aws.ddb.local(process.env.DYNAMODB_URI);
    } else {
        console.error('No local DynamoDB URL provided');
        exit(1);
    }
}

export const handler = async (
    event: EventBridgeEvent<
        string,
        UserDeletedEventDataType | UserCreatedEventDataType
    >,
    _context: Context,
    callback: Callback,
): Promise<void> => {
    console.log('Received event:', event);

    const eventType = _.get(event, Config.events.inputEvents.eventTypeLocation);
    let error: string | null = null;

    // User deleted event
    if (eventType === events.UserDeleted.type) {
        try {
            error = await userDeletedEventHandler(
                event as EventBridgeEvent<string, UserDeletedEventDataType>,
            );
        } catch (err) {
            console.error(err);

            if (err instanceof CustomError) {
                error = JSON.stringify(err.serializeErrors());
            }
        }
    } else if (eventType === events.UserCreated.type) {
        try {
            error = await userCreatedEventHandler(
                event as EventBridgeEvent<string, UserCreatedEventDataType>,
            );
        } catch (err) {
            console.error(err);

            if (err instanceof CustomError) {
                error = JSON.stringify(err.serializeErrors());
            }
        }
    } else {
        error = `Event type ${event['detail-type']} with detail type ${event.detail.type} not processed`;
    }

    if (callback) {
        callback(error, event);
    }
};
