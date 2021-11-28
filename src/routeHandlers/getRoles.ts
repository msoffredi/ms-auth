import { Role, RoleDoc } from '../models/role';
import { RouteHandler, Serializers } from '@jmsoffredi/ms-common';

export const getRolesHandler: RouteHandler = async (): Promise<RoleDoc[]> => {
    const roles = await Role.scan().all().exec();

    const serializedRoles = Role.serializeMany(
        roles,
        Serializers.RemoveTimestamps,
    );

    return serializedRoles;
};
