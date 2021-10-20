import { constructAPIGwEvent } from '../utils/helpers';
import { handler } from '../../src/handlers/auth';
import { Module } from '../../src/models/module';

const getAllEvent = constructAPIGwEvent(
    {},
    { method: 'GET', resource: '/v0/modules' },
);

it('should return a 200 and array of modules', async () => {
    const module = { id: 'mod123', name: 'Test module name' };
    await Module.create(module);

    const result = await handler(getAllEvent);

    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)[0]).toMatchObject(module);
});

it('should add a new module on POST with proper data', async () => {
    const newMod = { id: 'test', name: 'Test name' };
    const event = constructAPIGwEvent(newMod, {
        method: 'POST',
        resource: '/v0/modules',
    });

    const postResult = await handler(event);
    const expectedResult = {
        statusCode: 200,
        body: JSON.stringify(newMod),
    };
    expect(postResult).toEqual(expectedResult);

    const getResult = await handler(getAllEvent);

    expect(getResult.statusCode).toEqual(200);
    expect(JSON.parse(getResult.body)).toMatchObject([newMod]);
});

it('deletes a module when calling endpoint with id and DELETE method', async () => {
    const module = { id: 'mod123', name: 'Test module name' };
    await Module.create(module);

    const deleteEvent = constructAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/modules/{id}',
            pathParameters: { id: module.id },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(200);

    const getResult = await handler(getAllEvent);
    expect(JSON.parse(getResult.body)).toEqual([]);
});

it('throws an error if we do not provide a module id on delete', async () => {
    const deleteEvent = constructAPIGwEvent(
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
    const event = constructAPIGwEvent(
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

it('throws a 422 error if the id provided for a delete module is not found', async () => {
    const deleteEvent = constructAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/modules/{id}',
            pathParameters: { id: 'wrong-id' },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(422);
});
