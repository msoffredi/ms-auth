import { EventBridge } from 'aws-sdk';
import { Config } from '../config';
import { EventData } from './event-publisher';
import { AuthEventDetailTypes } from './types';

export const awsEventbridgePublisher = async (
    type: AuthEventDetailTypes,
    data: EventData,
    detailType: string,
): Promise<void> => {
    const eventbridge = new EventBridge();

    const params = {
        Entries: [
            {
                EventBusName: Config.events.busName,
                Detail: JSON.stringify({
                    type,
                    data,
                }),
                DetailType: detailType,
                Source: Config.events.outputSource,
                Time: new Date(),
            },
        ],
    };

    // @todo We need to validate the event was published or save it to publish it later
    const response = await eventbridge.putEvents(params).promise();
    console.log('Event publish response:', response);
};
