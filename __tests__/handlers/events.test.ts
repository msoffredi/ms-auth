import {
    AuthEventsDetailTypes,
    AuthEventDetailTypes,
} from '../../src/events/types';
import { handler } from '../../src/handlers/auth';
import { User } from '../../src/models/user';
import {
    addUserWithPermissions,
    constructEventBridgeEvent,
    testUserEmail,
} from '../utils/helpers';

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

    const result = await handler(event);
    expect(result.statusCode).toEqual(200);

    const user2 = await User.get(testUserEmail);
    expect(user2).toBeUndefined();
});
