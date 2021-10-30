import AWS from 'aws-sdk';
import { testUserEmail } from '../../utils/helpers';

AWS.config.update({ region: process.env.AWS_REGION });
const eventbridge = new AWS.EventBridge();

exports.lambdaHandler = async (event, context) => {
    const params = {
        Entries: [
            {
                Detail: JSON.stringify({
                    type: 'user.deleted',
                    userId: testUserEmail,
                }),
                DetailType: 'User Deleted',
                Source: 'test.users',
                Time: new Date(),
            },
        ],
    };
    const result = await eventbridge.putEvents(params).promise();

    console.log('--- Params ---');
    console.log(params);
    console.log('--- Response ---');
    console.log(result);
};