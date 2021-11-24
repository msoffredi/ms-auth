import AWS from 'aws-sdk';
import { exit } from 'process';

// Configure region
if (!process.env.AWS_REGION) {
    console.error('AWS_REGION environment variable not defined');
    exit(1);
}

AWS.config.update({ region: process.env.AWS_REGION });

const cognitoISP = new AWS.CognitoIdentityServiceProvider();

// Get all Cognito User Pools
cognitoISP.listUserPools(
    {
        MaxResults: '60',
    },
    (err, data) => {
        if (err) {
            console.error(err);
        } else {
            console.log(data);
            // Filter out User Pools of interest
            // const userPools = allUserPools.fi;
        }
    },
);
