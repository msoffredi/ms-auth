import { AuthEventDetailTypes } from '../events/types';
import {
    AuthorizationModules,
    AuthorizationOperations,
    ConfigType,
    EventBusTypes,
} from './types';

export const Config: ConfigType = {
    events: {
        eventBusType: EventBusTypes.AWSEventBridge,
        busName: 'default',
        inputEvents: {
            eventTypeLocation: 'detail.type',
            eventDataLocation: 'detail.data',
            events: {
                userDeleted: {
                    eventType: AuthEventDetailTypes.UserDeleted,
                    userIdLocation: 'detail.data.userId',
                },
            },
        },
    },
    Authorization: {
        Modules: {
            ReadModules: {
                moduleId: AuthorizationModules.Modules,
                operationId: AuthorizationOperations.Read,
            },
            DeleteModule: {
                moduleId: AuthorizationModules.Modules,
                operationId: AuthorizationOperations.Delete,
            },
            AddModule: {
                moduleId: AuthorizationModules.Modules,
                operationId: AuthorizationOperations.Add,
            },
        },
        Operations: {
            ReadOperations: {
                moduleId: AuthorizationModules.Operations,
                operationId: AuthorizationOperations.Read,
            },
            DeleteOperation: {
                moduleId: AuthorizationModules.Operations,
                operationId: AuthorizationOperations.Delete,
            },
            AddOperation: {
                moduleId: AuthorizationModules.Operations,
                operationId: AuthorizationOperations.Add,
            },
        },
        Permissions: {
            ReadPermissions: {
                moduleId: AuthorizationModules.Permissions,
                operationId: AuthorizationOperations.Read,
            },
            DeletePermission: {
                moduleId: AuthorizationModules.Permissions,
                operationId: AuthorizationOperations.Delete,
            },
            AddPermission: {
                moduleId: AuthorizationModules.Permissions,
                operationId: AuthorizationOperations.Add,
            },
        },
        Roles: {
            ReadRoles: {
                moduleId: AuthorizationModules.Roles,
                operationId: AuthorizationOperations.Read,
            },
            DeleteRole: {
                moduleId: AuthorizationModules.Roles,
                operationId: AuthorizationOperations.Delete,
            },
            AddRole: {
                moduleId: AuthorizationModules.Roles,
                operationId: AuthorizationOperations.Add,
            },
        },
        Users: {
            ReadUsers: {
                moduleId: AuthorizationModules.Users,
                operationId: AuthorizationOperations.Read,
            },
            DeleteUser: {
                moduleId: AuthorizationModules.Users,
                operationId: AuthorizationOperations.Delete,
            },
            AddUser: {
                moduleId: AuthorizationModules.Users,
                operationId: AuthorizationOperations.Add,
            },
        },
    },
};
