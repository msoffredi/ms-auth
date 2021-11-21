import { Config } from '../config';
import {
    eventBuses,
    EventDataType,
    EventSources,
    publisher,
} from '@jmsoffredi/ms-common';

export const authPublisher = async (
    data: EventDataType,
    detailType = '',
): Promise<void> => {
    await publisher(
        data,
        detailType || data.type,
        Config.events.eventBusType,
        eventBuses[Config.events.eventBusType].busName,
        EventSources.Authorization,
    );
};
