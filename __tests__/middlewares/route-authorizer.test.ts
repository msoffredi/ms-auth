import jwt from 'jsonwebtoken';
import { routeAuthorizer } from '../../src/middlewares/route-authorizer';
import { constructAPIGwEvent } from '../utils/helpers';
import { Config } from '../../src/config';

const callback = jest.fn();

it('authorizes a user with a double star permission', async () => {
    const token = jwt.sign(
        {
            email: 'test@test.com',
            userPermissions: JSON.stringify([['*', '*']]),
        },
        'test',
    );
    const event = constructAPIGwEvent({});
    event.headers = {
        ...event.headers,
        Authorization: `Bearer ${token}`,
    };

    await routeAuthorizer(
        event,
        callback,
        [Config.Authorization.Modules.ReadModules],
        false,
    );
    expect(callback).toHaveBeenCalled();
});

it('authorizes a user with precise permission', async () => {
    const { moduleId, operationId } = Config.Authorization.Modules.ReadModules;
    const token = jwt.sign(
        {
            email: 'test@test.com',
            userPermissions: JSON.stringify([[moduleId, operationId]]),
        },
        'test',
    );
    const event = constructAPIGwEvent({});
    event.headers = {
        ...event.headers,
        Authorization: `Bearer ${token}`,
    };

    await routeAuthorizer(event, callback, [{ moduleId, operationId }], false);
    expect(callback).toHaveBeenCalled();
});

it('does not authorize a user with wrong permission', async () => {
    const { moduleId, operationId } = Config.Authorization.Modules.ReadModules;
    const token = jwt.sign(
        {
            email: 'test@test.com',
            userPermissions: JSON.stringify([[moduleId, operationId]]),
        },
        'test',
    );
    const event = constructAPIGwEvent({});
    event.headers = {
        ...event.headers,
        Authorization: `Bearer ${token}`,
    };

    try {
        await routeAuthorizer(
            event,
            callback,
            [Config.Authorization.Modules.AddModule],
            false,
        );

        fail('routeAuthorizer must throw an error');
    } catch (err) {
        expect(callback).not.toHaveBeenCalled();
    }
});

it('authorizes a user with wrong permission but self request in enabled', async () => {
    const testEmail = 'test@test.com';
    const { moduleId, operationId } = Config.Authorization.Modules.ReadModules;
    const token = jwt.sign(
        {
            email: testEmail,
            userPermissions: JSON.stringify([[moduleId, operationId]]),
        },
        'test',
    );
    const event = constructAPIGwEvent(
        {},
        {
            pathParameters: { id: testEmail },
        },
    );
    event.headers = {
        ...event.headers,
        Authorization: `Bearer ${token}`,
    };

    await routeAuthorizer(
        event,
        callback,
        [Config.Authorization.Modules.AddModule],
        true,
    );
    expect(callback).toHaveBeenCalled();
});
