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
        id: 'test@test.com',
        roles: [role],
    };
    await User.create(userObj);

    const result = await handler(getAllEvent);
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)[0]).toMatchObject({
        id: userObj.id,
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

it('should return a 200 and a user on GET with id', async () => {
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
        id: 'test@test.com',
        roles: [role],
    };
    await User.create(userObj);
    const result = await User.get(userObj.id);
    expect(result).toBeDefined();

    const getEvent = constructAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/users/{id}',
            pathParameters: { id: userObj.id },
        },
    );
    const result2 = await handler(getEvent);

    expect(result2.statusCode).toEqual(200);
    expect(JSON.parse(result2.body)).toMatchObject({
        id: userObj.id,
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

it('throws a 422 error if the id provided to retrieve a user is not found', async () => {
    const getEvent = constructAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/users/{id}',
            pathParameters: { id: 'wrong-id' },
        },
    );
    const getResult = await handler(getEvent);
    expect(getResult.statusCode).toEqual(422);
});

it('throws an error if we do not provide a user id on get', async () => {
    const deleteEvent = constructAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/users/{id}',
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(400);
});

it('deletes a user when calling endpoint with id and DELETE method', async () => {
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
    const result = await User.get(userObj.id);
    expect(result).toBeDefined();

    const deleteEvent = constructAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/users/{id}',
            pathParameters: { id: userObj.id },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(200);

    const result2 = await User.get(userObj.id);
    expect(result2).toBeUndefined();
});

it('throws an error if we do not provide an user id on delete', async () => {
    const deleteEvent = constructAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/users/{id}',
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(400);
});

it('throws a 422 error if the id provided to delete a user is not found', async () => {
    const deleteEvent = constructAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/users/{id}',
            pathParameters: { id: 'wrong-id' },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(422);
});
