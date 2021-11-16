import {
    addUserWithPermissions,
    constructAuthenticatedAPIGwEvent,
} from '../utils/helpers';
import { handler } from '../../src/handlers/auth-api';
import { Operation } from '../../src/models/operation';
import { Permission } from '../../src/models/permission';

beforeEach(async () => {
    await addUserWithPermissions();
});

it('should return a 200 and array of operations', async () => {
    const operation = { id: 'op123', name: 'Test operation name' };
    await Operation.create(operation);

    const getAllEvent = constructAuthenticatedAPIGwEvent(
        {},
        { method: 'GET', resource: '/v0/operations' },
    );

    const result = await handler(getAllEvent);

    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)[0]).toMatchObject(operation);
});

it('should add a new operation on POST with proper data', async () => {
    const newOp = { id: 'test', name: 'Test name' };
    const event = constructAuthenticatedAPIGwEvent(newOp, {
        method: 'POST',
        resource: '/v0/operations',
    });

    const postResult = await handler(event);
    const expectedResult = {
        statusCode: 200,
        body: JSON.stringify(newOp),
    };
    expect(postResult).toEqual(expectedResult);

    const operation = await Operation.get(newOp.id);
    expect(operation).toBeDefined();
});

it('deletes an operation when calling endpoint with id and DELETE method', async () => {
    const operation = { id: 'op123', name: 'Test operation name' };
    await Operation.create(operation);

    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/operations/{id}',
            pathParameters: { id: operation.id },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(200);

    const testOp = await Operation.get(operation.id);
    expect(testOp).toBeUndefined();
});

it('throws an error if we do not provide an operation id on delete', async () => {
    const deleteEvent = constructAuthenticatedAPIGwEvent(
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
    const event = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'POST',
            resource: '/v0/operations',
        },
    );

    const postResult = await handler(event);
    expect(postResult.statusCode).toEqual(400);
});

it('throws a 404 error if the id provided for a delete operation is not found', async () => {
    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/operations/{id}',
            pathParameters: { id: 'wrong-id' },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(404);
});

it('does not delete an operation if it is linked to an existing permission', async () => {
    const permissions = await Permission.scan().exec();
    expect(permissions).toBeDefined();
    expect(permissions.length).toBeGreaterThan(0);

    const operationId = permissions[0].operationId;
    const operationBefore = await Operation.get(operationId);
    expect(operationBefore).toBeDefined();

    const deleteEvent = constructAuthenticatedAPIGwEvent(
        {},
        {
            method: 'DELETE',
            resource: '/v0/operations/{id}',
            pathParameters: { id: operationId },
        },
    );
    const delResult = await handler(deleteEvent);
    expect(delResult.statusCode).toEqual(422);

    const operationAfter = await Operation.get(operationId);
    expect(operationAfter).toBeDefined();
});
