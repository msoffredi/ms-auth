import { constructAPIGwEvent } from '../utils/helpers';
import { handler } from '../../src/handlers/auth';

const getAllEvent = constructAPIGwEvent(
    {},
    { method: 'GET', resource: '/v0/modules' },
);

it('should return a 200 and array of modules', async () => {
    const result = await handler(getAllEvent);

    const expectedResult = {
        statusCode: 200,
        body: JSON.stringify([]),
    };

    expect(result).toEqual(expectedResult);
});

it('should add a new module on POST with proper data', async () => {
    const newOp = { id: 'test', name: 'Test name' };
    const event = constructAPIGwEvent(newOp, {
        method: 'POST',
        resource: '/v0/modules',
    });

    const postResult = await handler(event);

    const expectedResult = {
        statusCode: 200,
        body: JSON.stringify(newOp),
    };

    // POST request should return new module object
    expect(postResult).toEqual(expectedResult);

    const getResult = await handler(getAllEvent);

    expect(getResult.statusCode).toEqual(200);
    expect(JSON.parse(getResult.body)).toMatchObject([newOp]);
});

it('deletes a module when calling endpoint with id and DELETE method', async () => {
    const newOp = { id: 'test', name: 'Test name' };

    const event = constructAPIGwEvent(newOp, {
        method: 'POST',
        resource: '/v0/modules',
    });
    const postResult = await handler(event);
    expect(postResult.statusCode).toEqual(200);

    const { id } = JSON.parse(postResult.body);
    const deleteEvent = constructAPIGwEvent(newOp, {
        method: 'DELETE',
        resource: '/v0/modules/{id}',
        pathParameters: { id },
    });
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(200);

    const getResult = await handler(getAllEvent);
    expect(JSON.parse(getResult.body)).toEqual([]);
});

it('throws an error if we do not provide a module id on delete', async () => {
    const newOp = { id: 'test', name: 'Test name' };

    const event = constructAPIGwEvent(newOp, {
        method: 'POST',
        resource: '/v0/modules',
    });
    const postResult = await handler(event);
    expect(postResult.statusCode).toEqual(200);

    const deleteEvent = constructAPIGwEvent(newOp, {
        method: 'DELETE',
        resource: '/v0/modules/{id}',
    });
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
    const newOp = { id: 'test', name: 'Test name' };

    const event = constructAPIGwEvent(newOp, {
        method: 'POST',
        resource: '/v0/modules',
    });
    const postResult = await handler(event);
    expect(postResult.statusCode).toEqual(200);

    const deleteEvent = constructAPIGwEvent(newOp, {
        method: 'DELETE',
        resource: '/v0/modules/{id}',
        pathParameters: { id: 'wrong-id' },
    });
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(422);
});
