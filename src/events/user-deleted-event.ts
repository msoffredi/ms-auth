import {
    DatabaseError,
    EventHandler,
    RequestValidationError,
} from '@jmsoffredi/ms-common';
import { EventBridgeEvent } from 'aws-lambda';
import _ from 'lodash';
import { Config } from '../config';
import { User } from '../models/user';
import { AuthEventDetail } from './types';

export const userDeletedEventHandler: EventHandler<string, AuthEventDetail> =
    async (
        event: EventBridgeEvent<string, AuthEventDetail>,
    ): Promise<string | null> => {
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

        return null;
    };
