import { User, UserDoc } from '../models/user';
import { Serializers } from '../models/_common';
import { RouteHandler } from './types';

export const getUsersHandler: RouteHandler = async (): Promise<UserDoc[]> => {
    const users = await User.scan().all().exec();

    const serializedUsers = User.serializeMany(
        users,
        Serializers.RemoveTimestamps,
    );

    return serializedUsers;
};
