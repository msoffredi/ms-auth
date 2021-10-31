import {
    addUserWithPermissions,
    constructAPIGwEvent,
    testUserEmail,
} from '../utils/helpers';
import { handler } from '../../src/handlers/auth';
import { ServiceStatus } from '../../src/handlers/types';
import { User } from '../../src/models/user';

// This includes all tests for auth.handler()
it('should return a 200 and a valid status as healthy on GET over healthcheck endpoint', async () => {
    const event = constructAPIGwEvent(
        {},
        { method: 'GET', resource: '/healthcheck' },
    );
    const result = await handler(event);

    const expectedResult = {
        statusCode: 200,
        body: JSON.stringify({ serviceStatus: ServiceStatus.Healthy }),
    };
    expect(result).toEqual(expectedResult);
});

it('should initialize DB with super admin and required authorization structure on init and user not present', async () => {
    process.env.SUPER_ADMIN_EMAIL = 'superadmin@test.com';

    const user = await User.get(process.env.SUPER_ADMIN_EMAIL);
    expect(user).toBeUndefined();

    const event = constructAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/healthcheck',
            pathParameters: { init: '1' },
        },
    );
    const result = await handler(event);
    expect(result.statusCode).toEqual(200);

    const newUser = await User.get(process.env.SUPER_ADMIN_EMAIL);
    expect(newUser).toBeDefined();
});

it('ignores initialization if super admin user exists', async () => {
    process.env.SUPER_ADMIN_EMAIL = testUserEmail;
    await addUserWithPermissions();

    const existingUsers = await User.scan().all().exec();
    expect(existingUsers.length).toBeGreaterThan(0);

    const event = constructAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/healthcheck',
            pathParameters: { init: '1' },
        },
    );
    const result = await handler(event);
    expect(result.statusCode).toEqual(200);

    const allUsers = await User.scan().all().exec();
    expect(existingUsers.length).toEqual(allUsers.length);
});

it('does not initialize super user if path parameter not provided', async () => {
    process.env.SUPER_ADMIN_EMAIL = 'superadmin@test.com';

    const user = await User.get(process.env.SUPER_ADMIN_EMAIL);
    expect(user).toBeUndefined();

    const event = constructAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/healthcheck',
        },
    );
    const result = await handler(event);
    expect(result.statusCode).toEqual(200);

    const newUser = await User.get(process.env.SUPER_ADMIN_EMAIL);
    expect(newUser).toBeUndefined();
});
