import {
    AuthEventsDetailTypes,
    AuthEventDetailTypes,
} from '../../src/events/types';
import { handler } from '../../src/handlers/auth-events';
import { User } from '../../src/models/user';
import {
    addUserWithPermissions,
    constructEventBridgeEvent,
    testContext,
    testUserEmail,
} from '../utils/helpers';

const callback = jest.fn();

it('Deletes a user on user.deleted event-bus event with valid user in the DB', async () => {
    await addUserWithPermissions();
    const user = await User.get(testUserEmail);
    expect(user).toBeDefined();

    const event = constructEventBridgeEvent(AuthEventsDetailTypes.UserDeleted, {
        type: AuthEventDetailTypes.UserDeleted,
        data: {
            userId: testUserEmail,
        },
    });

    await handler(event, testContext, callback);
    expect(callback).toHaveBeenCalled();

    const user2 = await User.get(testUserEmail);
    expect(user2).toBeUndefined();
});
