import { Role, RoleDoc } from '../models/role';
import { Serializers } from '../models/_common';
import { RouteHandler } from './types';

export const getRolesHandler: RouteHandler = async (): Promise<RoleDoc[]> => {
    const roles = await Role.scan().all().exec();

    const serializedRoles = Role.serializeMany(
        roles,
        Serializers.RemoveTimestamps,
    );

    return serializedRoles;
};
