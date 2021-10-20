import { handler } from '../../src/handlers/auth';
import { Module } from '../../src/models/module';
import { Operation } from '../../src/models/operation';
import { Permission } from '../../src/models/permission';
import { Role } from '../../src/models/role';
import { User } from '../../src/models/user';
import { constructAPIGwEvent } from '../utils/helpers';

const getAllEvent = constructAPIGwEvent(
    {},
    { method: 'GET', resource: '/v0/users' },
);

it('should return a 200 and array of users', async () => {
    const operationObj = { id: 'op123', name: 'Test operation name' };
    const operation = await Operation.create(operationObj);

    const moduleObj = { id: 'mod123', name: 'Test module name' };
    const module = await Module.create(moduleObj);

    const permissionObj = {
        id: 'per123',
        name: 'Test permission name',
        module,
        operation,
    };
    const permission = await Permission.create(permissionObj);

    const roleObj = {
        id: 'rol123',
        name: 'Test role username',
        permissions: [permission],
    };
    const role = await Role.create(roleObj);

    const userObj = {
        id: 'user123',
        username: 'test@test.com',
        roles: [role],
    };
    await User.create(userObj);

    const result = await handler(getAllEvent);
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)[0]).toMatchObject({
        id: userObj.id,
        username: userObj.username,
        roles: [
            {
                id: roleObj.id,
                name: roleObj.name,
                permissions: [
                    {
                        id: permissionObj.id,
                        name: permissionObj.name,
                        module: moduleObj,
                        operation: operationObj,
                    },
                ],
            },
        ],
    });
});

it('returns 200 and adds a new user on proper POST call', async () => {
    const operationObj = { id: 'op123', name: 'Test operation name' };
    const operation = await Operation.create(operationObj);

    const moduleObj = { id: 'mod123', name: 'Test module name' };
    const module = await Module.create(moduleObj);

    const permissionObj = {
        id: 'per123',
        name: 'Test permission name',
        module,
        operation,
    };
    const permission = await Permission.create(permissionObj);

    const roleObj = {
        id: 'rol123',
        name: 'Test role username',
        permissions: [permission],
    };
    const role = await Role.create(roleObj);

    const payload = {
        id: 'user123',
        username: 'Test user username',
        roles: [{ id: role.id }],
    };

    const postRoleEvent = constructAPIGwEvent(payload, {
        method: 'POST',
        resource: '/v0/users',
    });
    const result = await handler(postRoleEvent);
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body).id).toEqual(payload.id);
});

it('throws an error if calling POST without proper data', async () => {
    const event = constructAPIGwEvent(
        {},
        {
            method: 'POST',
            resource: '/v0/users',
        },
    );

    const postResult = await handler(event);
    expect(postResult.statusCode).toEqual(400);
});
