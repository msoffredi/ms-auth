import {
    AuthorizationModules,
    AuthorizationOperations,
    ConfigType,
} from './types';

export const Config: ConfigType = {
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
    },
};
