import { Config } from '../config';
import { EventData, publisher } from '@jmsoffredi/ms-common';
import { AuthEventDetailTypes } from './types';

export const authPublisher = async (
    type: AuthEventDetailTypes,
    data: EventData,
    detailType = '',
    eventBusType = Config.events.eventBusType,
): Promise<void> => {
    await publisher(
        type,
        data,
        detailType,
        eventBusType,
        Config.events.busName,
        Config.events.outputSource,
    );
};
