import { constructAPIGwEvent } from '../../utils/helpers';

import { handler } from '../../../src/handlers/auth';

// This includes all tests for auth.handler()
describe('Auth handler tests', () => {
    it('should return a 200 and an object with proper data', async () => {
        const event = constructAPIGwEvent(
            {},
            { method: 'GET', path: '/healthcheck' },
        );

        // Invoke exampleHandler()
        const result = await handler(event);

        const expectedResult = {
            statusCode: 200,
            body: JSON.stringify({ serviceStatus: 'healthy' }),
        };

        // Compare the result with the expected result
        expect(result).toEqual(expectedResult);
    });
});
