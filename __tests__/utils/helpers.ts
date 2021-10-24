import { APIGatewayProxyEvent } from 'aws-lambda';
import jwt from 'jsonwebtoken';
import {
    AuthorizationModules,
    AuthorizationOperations,
} from '../../src/config/types';
import { Module } from '../../src/models/module';
import { Operation } from '../../src/models/operation';
import { Permission } from '../../src/models/permission';
import { Role } from '../../src/models/role';
import { User } from '../../src/models/user';

export const testUserEmail = 'test@test.com';

export function constructAPIGwEvent(
    message: unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: Record<string, any> = {},
): APIGatewayProxyEvent {
    return {
        httpMethod: options.method || 'GET',
        path: options.path || '/',
        queryStringParameters: options.query || {},
        headers: options.headers || {},
        body: options.rawBody || JSON.stringify(message),
        multiValueHeaders: {},
        multiValueQueryStringParameters: {},
        isBase64Encoded: false,
        pathParameters: options.pathParameters || {},
        stageVariables: options.stageVariables || {},
        requestContext: options.requestContext || {},
        resource: options.resource || '',
    };
}

export const constructAuthenticatedAPIGwEvent = (
    message: unknown,
    options: Record<string, unknown>,
): APIGatewayProxyEvent => {
    const token = jwt.sign(
        {
            email: testUserEmail,
        },
        'test',
    );

    const event = constructAPIGwEvent(message, options);

    event.headers = {
        ...event.headers,
        Authorization: `Bearer ${token}`,
    };

    return event;
};

export const addUserWithPermissions = async () => {
    // Add Operations
    const readOperation = await Operation.create({
        id: AuthorizationOperations.Read,
        name: 'Read',
    });
    const addOperation = await Operation.create({
        id: AuthorizationOperations.Add,
        name: 'Add',
    });
    const deleteOperation = await Operation.create({
        id: AuthorizationOperations.Delete,
        name: 'Delete',
    });

    // Add Modules
    const authorizationModule = await Module.create({
        id: AuthorizationModules.Modules,
        name: 'Authorization Modules',
    });

    // Add Permissions
    const readModulesPermission = await Permission.create({
        id: 'authorization-api-read-modules',
        name: 'Authorization API Read Modules',
        module: authorizationModule,
        operation: readOperation,
    });
    const addModulePermission = await Permission.create({
        id: 'authorization-api-add-module',
        name: 'Authorization API Add Module',
        module: authorizationModule,
        operation: addOperation,
    });
    const deleteModulePermission = await Permission.create({
        id: 'authorization-api-delete-module',
        name: 'Authorization API Delete Module',
        module: authorizationModule,
        operation: deleteOperation,
    });

    // Add Roles
    const role = await Role.create({
        id: 'auth-user-test-role',
        name: 'Authorized User Test Role',
        permissions: [
            readModulesPermission,
            addModulePermission,
            deleteModulePermission,
        ],
    });

    // Add authorized user
    await User.create({
        id: testUserEmail,
        roles: [role],
    });
};
