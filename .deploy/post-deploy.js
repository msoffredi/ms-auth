import AWS from 'aws-sdk';
import { exit } from 'process';
import { getLambdaArn, setCognitoTrigger } from '@jmsoffredi/ms-common';

// Configure region
if (!process.env.AWS_REGION) {
    console.error('AWS_REGION environment variable not defined');
    exit(1);
}

AWS.config.update({ region: process.env.AWS_REGION });

try {
    const lambdaArn = await getLambdaArn(
        'ms-auth-CognitoPretokenTriggerFunction',
    );

    if (lambdaArn) {
        setCognitoTrigger('MsId', 'PreTokenGeneration', lambdaArn);
    } else {
        console.error(
            'We could not obtain a valid lambda Arn to use as a trigger',
        );
    }
} catch (err) {
    console.error(err.message);
}
