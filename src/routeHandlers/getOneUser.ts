import {
    DatabaseError,
    RequestValidationError,
    CustomAPIGatewayProxyEvent,
    RouteHandler,
    Serializers,
} from '@jmsoffredi/ms-common';
import { Permission } from '../models/permission';
import { Role } from '../models/role';
import { User, UserDoc } from '../models/user';

export const getOneUserHandler: RouteHandler = async (
    event: CustomAPIGatewayProxyEvent,
): Promise<UserDoc> => {
    if (!event.pathParameters || !event.pathParameters.id) {
        throw new RequestValidationError([
            {
                message: 'Id missing in URL or invalid',
                field: 'id',
            },
        ]);
    }

    const { id } = event.pathParameters;

    const user = await User.get(id);

    if (!user) {
        throw new DatabaseError(`Could not retrieve user with id: ${id}`);
    }

    if (event.currentUser && event.currentUser === id) {
        user.permissions = [];

        for (const roleId of user.roles) {
            const role = await Role.get(roleId);

            for (const perm of role.permissions) {
                user.permissions.push(await Permission.get(perm));
            }
        }
    }

    return new User(await user.serialize(Serializers.RemoveTimestamps));
};
