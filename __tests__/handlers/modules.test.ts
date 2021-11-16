import {
    addUserWithPermissions,
    constructAuthenticatedAPIGwEvent,
} from '../utils/helpers';
import { handler } from '../../src/handlers/auth-api';
import { Module } from '../../src/models/module';
import { Permission } from '../../src/models/permission';

beforeEach(async () => {
    await addUserWithPermissions();
});

it('should return a 200 and array of modules', async () => {
    const module = { id: 'mod123', name: 'Test module name' };
    await Module.create(module);

    const getAllEvent = constructAuthenticatedAPIGwEvent(
        {},
        { method: 'GET', resource: '/v0/modules' },
    );
    const result = await handler(getAllEvent);

    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body).length).toBeGreaterThan(0);
});

it('should add a new module on POST with proper data', async () => {
    const newMod = { id: 'test', name: 'Test name' };
    const event = constructAuthenticatedAPIGwEvent(newMod, {
        method: 'POST',
        resource: '/v0/modules',
    });

    const postResult = await handler(event);
    const expectedResult = {
        statusCode: 200,
        body: JSON.stringify(newMod),
    };
    expect(postResult).toEqual(expectedResult);

    const module = await Module.get(newMod.id);
    expect(module).toBeDefined();
});

it('deletes a module when calling endpoint with id and DELETE method', async () => {
    const module = { id: 'mod123', name: 'Test module name' };
    await Module.create(module);

    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/modules/{id}',
            pathParameters: { id: module.id },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(200);

    const delMod = await Module.get(module.id);
    expect(delMod).toBeUndefined();
});

it('throws an error if we do not provide a module id on delete', async () => {
    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/modules/{id}',
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(400);
});

it('throws an error if calling POST without proper data', async () => {
    const event = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'POST',
            resource: '/v0/modules',
        },
    );

    const postResult = await handler(event);

    // POST request should return new module object
    expect(postResult.statusCode).toEqual(400);
});

it('throws a 404 error if the id provided for a delete module is not found', async () => {
    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/modules/{id}',
            pathParameters: { id: 'wrong-id' },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(404);
});

it('does not delete a module if it is linked to an existing permission', async () => {
    const permissions = await Permission.scan().exec();
    expect(permissions).toBeDefined();
    expect(permissions.length).toBeGreaterThan(0);

    const moduleId = permissions[0].moduleId;
    const moduleBefore = await Module.get(moduleId);
    expect(moduleBefore).toBeDefined();

    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/modules/{id}',
            pathParameters: { id: moduleId },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(422);

    const moduleAfter = await Module.get(moduleId);
    expect(moduleAfter).toBeDefined();
});
