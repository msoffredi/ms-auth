import { handler } from '../../src/handlers/auth-api';
import { Module } from '../../src/models/module';
import { Operation } from '../../src/models/operation';
import { Permission, PermissionDoc } from '../../src/models/permission';
import { Role, RoleDoc } from '../../src/models/role';
import { User } from '../../src/models/user';
import {
    addUserWithPermissions,
    constructAuthenticatedAPIGwEvent,
} from '../utils/helpers';

beforeEach(async () => {
    await addUserWithPermissions();
});

const addPermission = async (): Promise<PermissionDoc> => {
    const operationObj = { id: 'op123', name: 'Test operation name' };
    const operation = await Operation.create(operationObj);

    const moduleObj = { id: 'mod123', name: 'Test module name' };
    const module = await Module.create(moduleObj);

    const permission = {
        id: 'per123',
        name: 'Test permission name',
        moduleId: module.id,
        operationId: operation.id,
    };
    return await Permission.create(permission);
};

const addRole = async (): Promise<RoleDoc> => {
    const permission = await addPermission();

    const roleObj = {
        id: 'rol123',
        name: 'Test role username',
        permissions: [permission.id],
    };

    return await Role.create(roleObj);
};

it('should return a 200 and array of roles', async () => {
    await addRole();

    const getAllEvent = constructAuthenticatedAPIGwEvent(
        {},
        { method: 'GET', resource: '/v0/roles' },
    );
    const result = await handler(getAllEvent);
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body).length).toBeGreaterThan(0);
});

it('returns 200 and adds a new role on proper POST call', async () => {
    const permission = await addPermission();

    const payload = {
        id: 'rol123',
        name: 'Test role name',
        permissions: [permission.id],
    };

    const postRoleEvent = constructAuthenticatedAPIGwEvent(payload, {
        method: 'POST',
        resource: '/v0/roles',
    });
    const result = await handler(postRoleEvent);
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)).toEqual(payload);
});

it('throws an error if calling POST without proper data', async () => {
    const event = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'POST',
            resource: '/v0/roles',
        },
    );

    const postResult = await handler(event);
    expect(postResult.statusCode).toEqual(400);
});

it('deletes a role when calling endpoint with id and DELETE method', async () => {
    const role = await addRole();
    const result = await Role.get(role.id);
    expect(result).toBeDefined();

    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/roles/{id}',
            pathParameters: { id: role.id },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(200);

    const result2 = await Role.get(role.id);
    expect(result2).toBeUndefined();
});

it('throws an error if we do not provide an role id on delete', async () => {
    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/roles/{id}',
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(400);
});

it('throws a 404 error if the id provided to delete a role is not found', async () => {
    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/roles/{id}',
            pathParameters: { id: 'wrong-id' },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(404);
});

it('should return a 200 and a role on GET with id', async () => {
    const role = await addRole();

    const result = await Role.get(role.id);
    expect(result).toBeDefined();

    const getEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/roles/{id}',
            pathParameters: { id: role.id },
        },
    );
    const result2 = await handler(getEvent);

    expect(result2.statusCode).toEqual(200);
    expect(JSON.parse(result2.body)).toMatchObject({
        id: role.id,
        name: role.name,
        permissions: role.permissions,
    });
});

it('throws a 422 error if the id provided to retrieve a role is not found', async () => {
    const getEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/roles/{id}',
            pathParameters: { id: 'wrong-id' },
        },
    );
    const getResult = await handler(getEvent);
    expect(getResult.statusCode).toEqual(422);
});

it('throws an error if we do not provide a role id on get', async () => {
    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/roles/{id}',
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(400);
});

it('does not delete a role if it is linked to an existing user', async () => {
    const users = await User.scan().exec();
    expect(users).toBeDefined();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0].roles.length).toBeGreaterThan(0);

    const roleId = users[0].roles[0];
    const roleBefore = await Role.get(roleId);
    expect(roleBefore).toBeDefined();

    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/roles/{id}',
            pathParameters: { id: roleId },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(422);

    const roleAfter = await Role.get(roleId);
    expect(roleAfter).toBeDefined();
});
