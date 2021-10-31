import { APIGatewayProxyEvent } from 'aws-lambda';
import { Config } from '../config';
import { HealthcheckResponseBody, ServiceStatus } from '../handlers/types';
import { Module } from '../models/module';
import { Operation } from '../models/operation';
import { Permission } from '../models/permission';
import { Role } from '../models/role';
import { User } from '../models/user';
import { RouteHandler } from './types';

export const healthcheckHandler: RouteHandler = async (
    event: APIGatewayProxyEvent,
): Promise<HealthcheckResponseBody> => {
    if (
        event.pathParameters &&
        event.pathParameters.init &&
        process.env.SUPER_ADMIN_EMAIL
    ) {
        const userId = process.env.SUPER_ADMIN_EMAIL;
        const user = await User.get(userId);

        if (!user) {
            await initSuperUser(process.env.SUPER_ADMIN_EMAIL);
        }
    }

    return {
        serviceStatus: ServiceStatus.Healthy,
    };
};

const authorizationAdminRole = {
    id: 'authorization-administrator',
    name: 'Authorization Service Administrator',
};

const initSuperUser = async (userId: string): Promise<void> => {
    const modules: string[] = [];
    const operations: string[] = [];
    const permissions: string[] = [];

    // Validate or create authorization permissions
    for (const section in Object(Config.Authorization)) {
        for (const subsection in Object(Config.Authorization)[section]) {
            const permission = await Permission.get(subsection);

            if (!permission) {
                const permissionCfg = Object(Config.Authorization)[section][
                    subsection
                ];

                if (permissionCfg.moduleId && permissionCfg.operationId) {
                    const { moduleId, operationId } = permissionCfg;

                    if (!modules[moduleId]) {
                        const module = await Module.get(moduleId);
                        if (!module) {
                            await Module.create({
                                id: moduleId,
                                name:
                                    moduleId.charAt(0).toUpperCase() +
                                    moduleId.slice(1).replace(/-/g, ' '),
                            });
                        }
                        modules.push(moduleId);
                    }

                    if (!operations[operationId]) {
                        const operation = await Operation.get(operationId);
                        if (!operation) {
                            await Operation.create({
                                id: operationId,
                                name:
                                    operationId.charAt(0).toUpperCase() +
                                    operationId.slice(1),
                            });
                        }
                        operations.push(operationId);
                    }

                    await Permission.create({
                        id: subsection,
                        name: subsection,
                        moduleId: permissionCfg.moduleId,
                        operationId: permissionCfg.operationId,
                    });
                }
            }

            permissions.push(subsection);
        }
    }

    // Validate or create super admin role
    const role = await Role.get(authorizationAdminRole.id);
    if (!role) {
        await Role.create({
            id: authorizationAdminRole.id,
            name: authorizationAdminRole.name,
            permissions,
        });
    }

    // Create user
    await User.create({
        id: userId,
        roles: [authorizationAdminRole.id],
    });
};
