import { ObjectType } from 'dynamoose/dist/General';
import { User, UserDoc } from '../models/user';
import { Serializers } from '../models/_common';

export const getUsersHandler = async (): Promise<ObjectType[]> => {
    const users = await User.scan().all().exec();

    const promises = User.serializeMany(
        users,
        Serializers.PopulateAndRemoveTimestamps,
    );

    // This code below is to resolve the fact dynamoose Model.serializeMany()
    // does not resolve promises in the Document.serialize()
    const formattedUsers: UserDoc[] = [];
    if (promises instanceof Array) {
        for (const promise of promises) {
            const obj = new User(await promise);
            formattedUsers.push(obj);
        }
    }

    return formattedUsers;
};
