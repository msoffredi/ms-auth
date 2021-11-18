import { Permission, PermissionDoc } from '../models/permission';
import { Serializers } from '../models/_common';
import { RouteHandler } from '@jmsoffredi/ms-common';

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
