// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWS = require('aws-sdk');

AWS.config.update({ region: process.env.AWS_REGION });
const eventbridge = new AWS.EventBridge();

exports.lambdaHandler = async () => {
    const params = {
        Entries: [
            {
                Detail: JSON.stringify({
                    type: 'user.deleted',
                    data: {
                        userId: 'test@test.com',
                    },
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
