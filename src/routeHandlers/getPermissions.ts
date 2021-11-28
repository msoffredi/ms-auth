import { Permission, PermissionDoc } from '../models/permission';
import { RouteHandler, Serializers } from '@jmsoffredi/ms-common';

export const getPermissionsHandler: RouteHandler = async (): Promise<
    PermissionDoc[]
> => {
    const permissions = await Permission.scan().all().exec();

    const serializedPermissions = Permission.serializeMany(
        permissions,
        Serializers.RemoveTimestamps,
    );

    return serializedPermissions;
};
