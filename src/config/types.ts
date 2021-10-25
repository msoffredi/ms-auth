import { AuthPermission } from '../middlewares/route-authorizer';

export interface ConfigType {
    Authorization: {
        Modules: {
            ReadModules: AuthPermission;
            DeleteModule: AuthPermission;
            AddModule: AuthPermission;
        };
        Operations: {
            ReadOperations: AuthPermission;
            DeleteOperation: AuthPermission;
            AddOperation: AuthPermission;
        };
        Permissions: {
            ReadPermissions: AuthPermission;
            DeletePermission: AuthPermission;
            AddPermission: AuthPermission;
        };
    };
}

export enum AuthorizationModules {
    Modules = 'authorization-api-modules',
    Operations = 'authorization-api-operations',
    Permissions = 'authorization-api-permissions',
    Roles = 'authorization-api-roles',
    Users = 'authorization-api-users',
}

export enum AuthorizationOperations {
    Read = 'read',
    Add = 'add',
    Delete = 'delete',
}
