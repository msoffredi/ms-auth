import { Permission, PermissionDoc } from '../models/permission';
import { Serializers } from '../models/_common';

export const getPermissionsHandler = async (): Promise<PermissionDoc> => {
    const permissions = await Permission.scan().all().exec();
    const populatedPermission = await permissions.populate();

    return Permission.serializeMany(
        populatedPermission,
        Serializers.RemoveTimestamps,
    );
};
