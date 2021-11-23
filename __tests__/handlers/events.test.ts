import { Types } from '@jmsoffredi/ms-common';
import { handler } from '../../src/handlers/auth-events';
import { Permission } from '../../src/models/permission';
import { Role } from '../../src/models/role';
import { User } from '../../src/models/user';
import {
    addUserWithPermissions,
    constructEventBridgeEvent,
    testContext,
    testUserEmail,
} from '../utils/helpers';

const callback = jest.fn();

beforeEach(() => {
    callback.mockReset();
});

it('Deletes a user on user.deleted event-bus event with valid user in the DB', async () => {
    await addUserWithPermissions();
    const user = await User.get(testUserEmail);
    expect(user).toBeDefined();

    const event = constructEventBridgeEvent(Types.UserDeleted, {
        type: Types.UserDeleted,
        data: {
            userId: testUserEmail,
        },
    });

    await handler(event, testContext, callback);
    expect(callback).toHaveBeenCalled();

    const user2 = await User.get(testUserEmail);
    expect(user2).toBeUndefined();
});

it('creates a new user on user.created event', async () => {
    const userId = 'user123';
    const user = await User.get(userId);
    expect(user).toBeUndefined();

    const event = constructEventBridgeEvent(Types.UserCreated, {
        type: Types.UserCreated,
        data: {
            id: userId,
            email: testUserEmail,
        },
    });

    await handler(event, testContext, callback);
    expect(callback).toHaveBeenCalled();

    const user2 = await User.get(userId);
    expect(user2).toBeDefined();
    expect(user2.roles.length).toEqual(0);
});

it('creates a new super admin on user.created event with email = super admin', async () => {
    process.env.SUPER_ADMIN_EMAIL = testUserEmail;
    const userId = 'user123';
    const user = await User.get(userId);
    expect(user).toBeUndefined();

    const event = constructEventBridgeEvent(Types.UserCreated, {
        type: Types.UserCreated,
        data: {
            id: userId,
            email: testUserEmail,
        },
    });

    await handler(event, testContext, callback);
    expect(callback).toHaveBeenCalled();

    const user2 = await User.get(userId);
    expect(user2).toBeDefined();
    expect(user2.roles.length).toEqual(1);

    const role = await Role.get(user2.roles[0]);
    expect(role.permissions.length).toEqual(1);

    const permission = await Permission.get(role.permissions[0]);
    expect(permission.operationId).toEqual('*');
    expect(permission.moduleId).toEqual('*');
});
