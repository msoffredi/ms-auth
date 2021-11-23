import {
    DatabaseError,
    EventHandler,
    RequestValidationError,
    UserCreatedEventDataType,
} from '@jmsoffredi/ms-common';
import { EventBridgeEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';
import _ from 'lodash';
import { Config } from '../config';
import { Permission, PermissionDoc } from '../models/permission';
import { Role, RoleDoc } from '../models/role';
import { User } from '../models/user';

export const userCreatedEventHandler: EventHandler<
    string,
    UserCreatedEventDataType
> = async (
    event: EventBridgeEvent<string, UserCreatedEventDataType>,
): Promise<string | null> => {
    const userId = _.get(
        event,
        Config.events.inputEvents.events.userCreated.userIdLocation,
    );

    if (!userId) {
        throw new RequestValidationError([
            {
                message: 'user id missing in event detail.data',
                field: 'id',
            },
        ]);
    }

    const user = await User.get(userId);

    if (!user) {
        const userEmail = _.get(
            event,
            Config.events.inputEvents.events.userCreated.userEmailLocation,
        );

        let roles: string[] = [];
        if (userEmail === process.env.SUPER_ADMIN_EMAIL) {
            console.log(`New super user initialized`);
            roles = await initSuperAdminRole();
        }

        await User.create({
            id: userId,
            roles,
        });
    } else {
        throw new DatabaseError(
            `Could not create user with id: ${userId}. User already exists!`,
        );
    }

    return null;
};

const initSuperAdminRole = async (): Promise<string[]> => {
    const roleIds: string[] = [];
    let perm: PermissionDoc;
    let role: RoleDoc;

    const permissions = await Permission.scan()
        .where('moduleId')
        .eq('*')
        .and()
        .where('operationId')
        .eq('*')
        .exec();

    if (permissions && permissions.length) {
        perm = permissions[0];
    } else {
        perm = await Permission.create({
            id: randomUUID(),
            name: 'Super Admin Permission',
            moduleId: '*',
            operationId: '*',
        });
    }

    const roles = await Role.scan().where('roles').eq([perm.id]).exec();

    if (roles && roles.length) {
        role = roles[0];
    } else {
        role = await Role.create({
            id: randomUUID(),
            name: 'Super Admin Role',
            permissions: [perm.id],
        });
    }

    roleIds.push(role.id);

    return roleIds;
};
