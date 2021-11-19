import { APIGatewayProxyEvent, EventBridgeEvent, Context } from 'aws-lambda';
import jwt from 'jsonwebtoken';
import { Permission } from '../../src/models/permission';
import { Role } from '../../src/models/role';
import { User } from '../../src/models/user';
import { AuthEventDetail } from '../../src/events/types';

export const testUserEmail = 'test@test.com';
export const superAdminTestPermission = 'super-admin-test-permission';

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
    userEmail = testUserEmail,
    userPermissions = [['*', '*']],
): APIGatewayProxyEvent => {
    const token = jwt.sign(
        {
            email: userEmail,
            userPermissions: JSON.stringify(userPermissions),
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

/**
 * detail format: { type: 'user.deleted', userId: 'test@test.com' }
 *
 * @param detailType
 * @param detail
 * @returns
 */
export const constructEventBridgeEvent = (
    detailType: string,
    detail: AuthEventDetail,
): EventBridgeEvent<string, AuthEventDetail> => {
    return {
        version: '0',
        id: '123456',
        'detail-type': detailType,
        source: 'test.users',
        account: '123456789',
        time: new Date().toISOString(),
        region: 'us-east-1',
        resources: [],
        detail: detail,
    };
};

export const addUserWithPermissions = async () => {
    const superAdminPermission = await Permission.create({
        id: superAdminTestPermission,
        name: 'Super Admin Permission',
        moduleId: '*',
        operationId: '*',
    });

    // Add Roles
    const role = await Role.create({
        id: 'auth-user-test-role',
        name: 'Authorized User Test Role',
        permissions: [superAdminPermission.id],
    });

    // Add authorized user
    await User.create({
        id: testUserEmail,
        roles: [role.id],
    });
};

export const testContext: Context = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: '',
    functionVersion: '',
    invokedFunctionArn: '',
    memoryLimitInMB: '',
    awsRequestId: '',
    logGroupName: '',
    logStreamName: '',
    getRemainingTimeInMillis: () => 0,
    done: () => {
        return;
    },
    fail: () => {
        return;
    },
    succeed: () => {
        return;
    },
};
