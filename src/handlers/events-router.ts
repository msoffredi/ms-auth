import { EventBridgeEvent } from 'aws-lambda';
import _ from 'lodash';
import { Config } from '../config';
import { CustomError } from '../errors/custom-error';
import {
    AuthEventDetail,
    AuthEventDetailTypes,
    AuthEventsDetailTypes,
} from '../events/types';
import { userDeletedEventHandler } from '../events/user-deleted-event';
import { HandlerResponse, ResponseBody } from './types';

export const eventsRouter = async (
    event: EventBridgeEvent<AuthEventsDetailTypes, AuthEventDetail>,
): Promise<HandlerResponse> => {
    const eventType = _.get(event, Config.events.inputEvents.eventTypeLocation);
    let status = 200;
    let body: ResponseBody = null;

    // User deleted event
    if (eventType === AuthEventDetailTypes.UserDeleted) {
        try {
            body = await userDeletedEventHandler(event);
        } catch (err) {
            console.error(err);

            if (err instanceof CustomError) {
                status = err.statusCode;
                body = err.serializeErrors();
            }
        }
    } else {
        status = 404;
        body = {
            message: `Event type ${event['detail-type']} with detail type ${event.detail.type} not processed`,
        };
    }

    return { status, body };
};
