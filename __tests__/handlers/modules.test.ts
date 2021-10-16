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
    const expectedResult = {
        statusCode: 200,
        body: JSON.stringify(newOp),
    };
    expect(postResult).toEqual(expectedResult);

    let getResult = await handler(getAllEvent);
    expect(JSON.parse(getResult.body)).toMatchObject([newOp]);

    const { id } = JSON.parse(postResult.body);
    const deleteEvent = constructAPIGwEvent(newOp, {
        method: 'DELETE',
        resource: '/v0/modules/{id}',
        pathParameters: { id },
    });
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(200);

    getResult = await handler(getAllEvent);
    expect(JSON.parse(getResult.body)).toEqual([]);
});
