import { ObjectType } from 'dynamoose/dist/General';
import { Permission, PermissionDoc } from '../models/permission';
import { Serializers } from '../models/_common';

export const getPermissionsHandler = async (): Promise<ObjectType[]> => {
    const permissions = await Permission.scan().all().exec();

    const promises = Permission.serializeMany(
        permissions,
        Serializers.PopulateAndRemoveTimestamps,
    );

    // This code below is to resolve the fact dynamoose Model.serializeMany()
    // does not resolve promises in the Document.serialize()
    const formattedPermissions: PermissionDoc[] = [];
    if (promises instanceof Array) {
        for (const promise of promises) {
            const obj = new Permission(await promise);
            formattedPermissions.push(obj);
        }
    }

    return formattedPermissions;
};
