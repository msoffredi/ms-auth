import { constructAPIGwEvent } from '../utils/helpers';
import { handler } from '../../src/handlers/auth';
import { Operation } from '../../src/models/operation';
import { Module } from '../../src/models/module';
import { Permission } from '../../src/models/permission';

const getAllEvent = constructAPIGwEvent(
    {},
    { method: 'GET', resource: '/v0/permissions' },
);

it('should return a 200 and array of permissions', async () => {
    const operationObj = { id: 'op123', name: 'Test operation name' };
    const operation = await Operation.create(operationObj);

    const moduleObj = { id: 'mod123', name: 'Test module name' };
    const module = await Module.create(moduleObj);

    const permission = {
        id: 'per123',
        name: 'Test permission name',
        module,
        operation,
    };
    await Permission.create(permission);

    const result = await handler(getAllEvent);
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)[0]).toMatchObject({
        id: permission.id,
        name: permission.name,
        module: moduleObj,
        operation: operationObj,
    });
});

it('should add a new permission on POST with proper data', async () => {
    const operation = { id: 'op123', name: 'Test operation name' };
    await Operation.create(operation);

    const module = { id: 'mod123', name: 'Test module name' };
    await Module.create(module);

    const newPerm = {
        id: 'abc123',
        name: 'Test permission name',
        module_id: module.id,
        operation_id: operation.id,
    };
    const event = constructAPIGwEvent(newPerm, {
        method: 'POST',
        resource: '/v0/permissions',
    });

    const postResult = await handler(event);
    expect(postResult.statusCode).toEqual(200);
    expect(JSON.parse(postResult.body)).toMatchObject({
        id: newPerm.id,
        name: newPerm.name,
        module,
        operation,
    });

    const getResult = await handler(getAllEvent);
    expect(getResult.statusCode).toEqual(200);
    expect(JSON.parse(getResult.body).length).toEqual(1);
});

it('throws an error if calling POST without proper data', async () => {
    const event = constructAPIGwEvent(
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
    const operation = await Operation.create({
        id: 'op123',
        name: 'Test operation name',
    });
    const module = await Module.create({
        id: 'mod123',
        name: 'Test module name',
    });

    const permission = {
        id: 'perm123',
        name: 'Test permission name',
        module,
        operation,
    };
    await Permission.create(permission);

    const deleteEvent = constructAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/permissions/{id}',
            pathParameters: { id: permission.id },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(200);

    const getResult = await handler(getAllEvent);
    expect(JSON.parse(getResult.body)).toEqual([]);
});

it('throws an error if we do not provide an permission id on delete', async () => {
    const deleteEvent = constructAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/permissions/{id}',
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(400);
});

it('throws a 422 error if the id provided for a delete permission is not found', async () => {
    const deleteEvent = constructAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/permissions/{id}',
            pathParameters: { id: 'wrong-id' },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(422);
});

it('should return a 200 and a permissions on GET with id', async () => {
    const operationObj = { id: 'op123', name: 'Test operation name' };
    const operation = await Operation.create(operationObj);

    const moduleObj = { id: 'mod123', name: 'Test module name' };
    const module = await Module.create(moduleObj);

    const permission = {
        id: 'per123',
        name: 'Test permission name',
        module,
        operation,
    };
    await Permission.create(permission);

    const getEvent = constructAPIGwEvent(
        {},
        {
            method: 'GET',
            resource: '/v0/permissions/{id}',
            pathParameters: { id: permission.id },
        },
    );
    const result = await handler(getEvent);

    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)).toMatchObject({
        id: permission.id,
        name: permission.name,
        module: moduleObj,
        operation: operationObj,
    });
});

it('throws a 422 error if the id provided to retrieve a permission is not found', async () => {
    const getEvent = constructAPIGwEvent(
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
