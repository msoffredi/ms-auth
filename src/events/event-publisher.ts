import { Config } from '../config';
import { EventBusTypes } from '../config/types';
import { awsEventbridgePublisher } from './aws-eventbridge-publisher';
import { AuthEventDetailTypes } from './types';

export interface EventData {
    [key: string]: unknown;
}

export const publisher = async (
    type: AuthEventDetailTypes,
    data: EventData,
    detailType = '',
): Promise<void> => {
    if (Config.events.eventBusType === EventBusTypes.AWSEventBridge) {
        await awsEventbridgePublisher(type, data, detailType);
    }
};
