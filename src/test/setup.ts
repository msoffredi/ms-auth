import dynamoose from 'dynamoose';
import { clearAllTables } from './dynamodb-utils';

/**
 * jest won't work in watchAll mode because of a known BUG.
 * Waiting for new @shelfio/jest-dynamodb release (currently using v2.1.0)
 */
dynamoose.aws.sdk.config.update({
    accessKeyId: 'fakeMyKeyId',
    secretAccessKey: 'fakeSecretAccessKey',
    region: 'local-env',
    sslEnabled: false,
});

dynamoose.aws.ddb.local();

beforeEach(async () => {
    await clearAllTables(dynamoose.aws.ddb());
});