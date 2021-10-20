import { ObjectType } from 'dynamoose/dist/General';
import { Role, RoleDoc } from '../models/role';
import { Serializers } from '../models/_common';

export const getRolesHandler = async (): Promise<ObjectType[]> => {
    const roles = await Role.scan().all().exec();

    const promises = Role.serializeMany(
        roles,
        Serializers.PopulateAndRemoveTimestamps,
    );

    // This code below is to resolve the fact dynamoose Model.serializeMany()
    // does not resolve promises in the Document.serialize()
    const formattedRoles: RoleDoc[] = [];
    if (promises instanceof Array) {
        for (const promise of promises) {
            const obj = new Role(await promise);
            formattedRoles.push(obj);
        }
    }

    return formattedRoles;
};
