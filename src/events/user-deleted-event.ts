import { EventBridgeEvent } from 'aws-lambda';
import _ from 'lodash';
import { Config } from '../config';
import { DatabaseError } from '../errors/database-error';
import { RequestValidationError } from '../errors/request-validation-error';
import { DeleteRecordResponseBody } from '../handlers/types';
import { User } from '../models/user';
import { AuthEventDetail, AuthEventsDetailTypes, EventHandler } from './types';

export const userDeletedEventHandler: EventHandler = async (
    event: EventBridgeEvent<AuthEventsDetailTypes, AuthEventDetail>,
): Promise<DeleteRecordResponseBody> => {
    const userId = _.get(
        event,
        Config.events.inputEvents.events.userDeleted.userIdLocation,
    );

    if (!userId) {
        throw new RequestValidationError([
            {
                message: 'userId missing in event detail.data',
                field: 'userId',
            },
        ]);
    }

    const user = await User.get(userId);

    if (user) {
        await User.delete(userId);
    } else {
        throw new DatabaseError(`Could not delete user with id: ${userId}`);
    }

    return {
        deleted: userId,
    };
};
