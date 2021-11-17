import dynamoose from 'dynamoose';
import { Callback, Context, EventBridgeEvent } from 'aws-lambda';
import _ from 'lodash';
import { exit } from 'process';
import { Config } from '../config';
import { CustomError } from '../errors/custom-error';
import {
    AuthEventDetail,
    AuthEventDetailTypes,
    AuthEventsDetailTypes,
} from '../events/types';
import { userDeletedEventHandler } from '../events/user-deleted-event';

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
    event: EventBridgeEvent<AuthEventsDetailTypes, AuthEventDetail>,
    _context: Context,
    callback: Callback,
): Promise<void> => {
    const eventType = _.get(event, Config.events.inputEvents.eventTypeLocation);
    let error: string | null = null;

    // User deleted event
    if (eventType === AuthEventDetailTypes.UserDeleted) {
        try {
            error = await userDeletedEventHandler(event);
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