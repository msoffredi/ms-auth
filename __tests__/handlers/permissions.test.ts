import {
    addUserWithPermissions,
    constructAuthenticatedAPIGwEvent,
} from '../utils/helpers';
import { handler } from '../../src/handlers/auth-api';
import { Operation } from '../../src/models/operation';
import { Module } from '../../src/models/module';
import { Permission, PermissionDoc } from '../../src/models/permission';
import { Role } from '../../src/models/role';

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

it('should return a 200 and array of permissions', async () => {
    await addPermission();

    const getAllEvent = constructAuthenticatedAPIGwEvent(
        {},
        { method: 'GET', resource: '/v0/permissions' },
    );
    const result = await handler(getAllEvent);
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body).length).toBeGreaterThan(0);
});

it('should add a new permission on POST with proper data', async () => {
    const operation = { id: 'op123', name: 'Test operation name' };
    await Operation.create(operation);

    const module = { id: 'mod123', name: 'Test module name' };
    await Module.create(module);

    const newPerm = {
        id: 'per123',
        name: 'Test permission name',
        module_id: module.id,
        operation_id: operation.id,
    };
    const event = constructAuthenticatedAPIGwEvent(newPerm, {
        method: 'POST',
        resource: '/v0/permissions',
    });

    const postResult = await handler(event);
    expect(postResult.statusCode).toEqual(200);
    expect(JSON.parse(postResult.body)).toMatchObject({
        id: newPerm.id,
        name: newPerm.name,
        moduleId: module.id,
        operationId: operation.id,
    });

    const perm = await Permission.get(newPerm.id);
    expect(perm).toBeDefined();
});

it('throws an error if calling POST without proper data', async () => {
    const event = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'POST',
            resource: '/v0/permissions',
        },
    );

    const postResult = await handler(event);
    expect(postResult.statusCode).toEqual(400);
});

it('deletes a permission when calling endpoint with id and DELETE method', async () => {
    const permission = await addPermission();

    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/permissions/{id}',
            pathParameters: { id: permission.id },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(200);

    const perm = await Permission.get(permission.id);
    expect(perm).toBeUndefined();
});

it('throws an error if we do not provide an permission id on delete', async () => {
    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/permissions/{id}',
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(400);
});

it('throws a 404 error if the id provided for a delete permission is not found', async () => {
    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/permissions/{id}',
            pathParameters: { id: 'wrong-id' },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(404);
});

it('should return a 200 and a permissions on GET with id', async () => {
    const permission = await addPermission();

    const getEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/permissions/{id}',
            pathParameters: { id: permission.id },
        },
    );
    const result = await handler(getEvent);

    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body).id).toEqual(permission.id);
});

it('throws a 422 error if the id provided to retrieve a permission is not found', async () => {
    const getEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/permissions/{id}',
            pathParameters: { id: 'wrong-id' },
        },
    );
    const getResult = await handler(getEvent);
    expect(getResult.statusCode).toEqual(422);
});

it('throws an error if we do not provide an permission id on get', async () => {
    const getOneEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/permissions/{id}',
        },
    );
    const delResult = await handler(getOneEvent);
    expect(delResult.statusCode).toEqual(400);
});

it('does not delete a permission if it is linked to an existing role', async () => {
    const roles = await Role.scan().exec();
    expect(roles).toBeDefined();
    expect(roles.length).toBeGreaterThan(0);
    expect(roles[0].permissions.length).toBeGreaterThan(0);

    const permissionId = roles[0].permissions[0];
    const permissionBefore = await Permission.get(permissionId);
    expect(permissionBefore).toBeDefined();

    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/permissions/{id}',
            pathParameters: { id: permissionId },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(422);

    const permissionAfter = await Permission.get(permissionId);
    expect(permissionAfter).toBeDefined();
});
