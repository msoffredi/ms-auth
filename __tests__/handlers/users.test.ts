import { handler } from '../../src/handlers/auth-api';
import { Module } from '../../src/models/module';
import { Operation } from '../../src/models/operation';
import { Permission } from '../../src/models/permission';
import { Role, RoleDoc } from '../../src/models/role';
import { User, UserDoc } from '../../src/models/user';
import {
    addUserWithPermissions,
    constructAuthenticatedAPIGwEvent,
    superAdminTestPermission,
    testUserEmail,
} from '../utils/helpers';
import { publisher } from '../../src/events/event-publisher';
import { AuthEventDetailTypes } from '../../src/events/types';

beforeEach(async () => {
    await addUserWithPermissions();
});

const addRole = async (): Promise<RoleDoc> => {
    const operationObj = { id: 'op123', name: 'Test operation name' };
    const operation = await Operation.create(operationObj);

    const moduleObj = { id: 'mod123', name: 'Test module name' };
    const module = await Module.create(moduleObj);

    const permissionObj = {
        id: 'per123',
        name: 'Test permission name',
        moduleId: module.id,
        operationId: operation.id,
    };
    const permission = await Permission.create(permissionObj);

    const roleObj = {
        id: 'rol123',
        name: 'Test role username',
        permissions: [permission.id],
    };

    return await Role.create(roleObj);
};

const addUser = async (): Promise<UserDoc> => {
    const role = await addRole();

    const userObj = {
        id: 'test',
        roles: [role.id],
    };

    return await User.create(userObj);
};

it('should return a 200 and array of users', async () => {
    await addUser();

    const getAllEvent = constructAuthenticatedAPIGwEvent(
        {},
        { method: 'GET', resource: '/v0/users' },
    );

    const result = await handler(getAllEvent);
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)).toBeInstanceOf(Array);
    expect(JSON.parse(result.body).length).toBeGreaterThan(0);
});

it('returns 200 and adds a new user on proper POST call', async () => {
    const role = await addRole();

    const payload = {
        id: 'user123',
        username: 'Test user username',
        roles: [role.id],
    };

    const postRoleEvent = constructAuthenticatedAPIGwEvent(payload, {
        method: 'POST',
        resource: '/v0/users',
    });
    const result = await handler(postRoleEvent);
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body).id).toEqual(payload.id);
});

it('throws an error if calling POST without proper data', async () => {
    const event = constructAuthenticatedAPIGwEvent(
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
    const user = await addUser();

    const getEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/users/{id}',
            pathParameters: { id: user.id },
        },
    );
    const result = await handler(getEvent);

    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)).toMatchObject({
        id: user.id,
        roles: user.roles,
    });
});

it('throws a 422 error if the id provided to retrieve a user is not found', async () => {
    const getEvent = constructAuthenticatedAPIGwEvent(
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
    const deleteEvent = constructAuthenticatedAPIGwEvent(
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
    const user = await addUser();

    const result = await User.get(user.id);
    expect(result).toBeDefined();

    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/users/{id}',
            pathParameters: { id: user.id },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(200);

    const result2 = await User.get(user.id);
    expect(result2).toBeUndefined();

    expect(publisher).toHaveBeenCalledWith(
        AuthEventDetailTypes.AuthUserDeleted,
        {
            userId: user.id,
        },
    );
});

it('throws an error if we do not provide an user id on delete', async () => {
    const deleteEvent = constructAuthenticatedAPIGwEvent(
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
    const deleteEvent = constructAuthenticatedAPIGwEvent(
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

it('should return a 200 and a user on GET with id equal to the logged in user and without reading permissions', async () => {
    const user = await User.get(testUserEmail);
    const role = await Role.get(user.roles[0]);
    role.permissions = role.permissions.filter((perm) => {
        if (perm === superAdminTestPermission) {
            return false;
        }

        return true;
    });
    await role.save();

    const getEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/users/{id}',
            pathParameters: { id: testUserEmail },
        },
        testUserEmail,
        [],
    );
    const result = await handler(getEvent);

    expect(result.statusCode).toEqual(200);
    const body = JSON.parse(result.body);
    expect(body.id).toEqual(testUserEmail);
    expect(body.permissions).toBeDefined();
});

it('should return 401 on GET with a user without permission and not requesting own id', async () => {
    const user = await User.get(testUserEmail);
    const role = await Role.get(user.roles[0]);
    role.permissions = role.permissions.filter((perm) => {
        if (perm === superAdminTestPermission) {
            return false;
        }

        return true;
    });
    await role.save();

    const getEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/users/{id}',
            pathParameters: { id: 'other-user' },
        },
        testUserEmail,
        [],
    );
    const result = await handler(getEvent);

    expect(result.statusCode).toEqual(401);
});
