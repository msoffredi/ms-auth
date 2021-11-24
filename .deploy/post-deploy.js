import AWS from 'aws-sdk';
import { exit } from 'process';
import { setCognitoTrigger } from './utils.js';

// Configure region
if (!process.env.AWS_REGION) {
    console.error('AWS_REGION environment variable not defined');
    exit(1);
}

AWS.config.update({ region: process.env.AWS_REGION });

try {
    setCognitoTrigger(
        'MsId',
        'PreTokenGeneration',
        'ms-auth-CognitoPretokenTriggerFunction',
    );
} catch (err) {
    console.error(err.message);
}
