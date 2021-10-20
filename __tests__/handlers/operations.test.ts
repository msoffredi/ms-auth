import { constructAPIGwEvent } from '../utils/helpers';
import { handler } from '../../src/handlers/auth';
import { Operation } from '../../src/models/operation';

const getAllEvent = constructAPIGwEvent(
    {},
    { method: 'GET', resource: '/v0/operations' },
);

it('should return a 200 and array of operations', async () => {
    const operation = { id: 'op123', name: 'Test operation name' };
    await Operation.create(operation);

    const result = await handler(getAllEvent);

    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)[0]).toMatchObject(operation);
});

it('should add a new operation on POST with proper data', async () => {
    const newOp = { id: 'test', name: 'Test name' };
    const event = constructAPIGwEvent(newOp, {
        method: 'POST',
        resource: '/v0/operations',
    });

    const postResult = await handler(event);
    const expectedResult = {
        statusCode: 200,
        body: JSON.stringify(newOp),
    };
    expect(postResult).toEqual(expectedResult);

    const getResult = await handler(getAllEvent);

    expect(getResult.statusCode).toEqual(200);
    expect(JSON.parse(getResult.body)).toMatchObject([newOp]);
});

it('deletes an operation when calling endpoint with id and DELETE method', async () => {
    const operation = { id: 'op123', name: 'Test operation name' };
    await Operation.create(operation);

    const deleteEvent = constructAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/operations/{id}',
            pathParameters: { id: operation.id },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(200);

    const getResult = await handler(getAllEvent);
    expect(JSON.parse(getResult.body)).toEqual([]);
});

it('throws an error if we do not provide an operation id on delete', async () => {
    const deleteEvent = constructAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/operations/{id}',
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
            resource: '/v0/operations',
        },
    );

    const postResult = await handler(event);
    expect(postResult.statusCode).toEqual(400);
});

it('throws a 422 error if the id provided for a delete operation is not found', async () => {
    const deleteEvent = constructAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/operations/{id}',
            pathParameters: { id: 'wrong-id' },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(422);
});
