import {
    BasePreTokenGenerationTriggerEvent,
    Callback,
    Context,
} from 'aws-lambda';
import dynamoose from 'dynamoose';
import { exit } from 'process';
import { Permission } from '../models/permission';
import { Role } from '../models/role';
import { User } from '../models/user';
import {
    CognitoPreTokenGenerationTriggerSources,
    UserPermissionsType,
} from './types';

if (process.env.AWS_SAM_LOCAL) {
    if (process.env.DYNAMODB_URI) {
        dynamoose.aws.ddb.local(process.env.DYNAMODB_URI);
    } else {
        console.error('No local DynamoDB URL provided');
        exit(1);
    }
}

export const handler = async (
    event: BasePreTokenGenerationTriggerEvent<CognitoPreTokenGenerationTriggerSources>,
    _context: Context,
    callback: Callback,
): Promise<void> => {
    console.log('Trigger event:', event);

    let error = null;
    const { userAttributes } = event.request;

    if (
        !userAttributes['cognito:user_status'] ||
        ['CONFIRMED', 'FORCE_CHANGE_PASSWORD'].indexOf(
            userAttributes['cognito:user_status'],
        ) < 0
    ) {
        console.log('User status invalid', userAttributes);
        error = 'User account status can not be authorized';
    } else if (!userAttributes.email) {
        console.log('User email missing', userAttributes);
        error = 'User email is missing in user attributes';
    } else {
        const userPermissions: UserPermissionsType = [];
        const user = await User.get(userAttributes.email);

        if (user) {
            for (const roleId of user.roles) {
                const role = await Role.get(roleId);

                if (role) {
                    for (const permissionId of role.permissions) {
                        const perm = await Permission.get(permissionId);

                        if (perm) {
                            userPermissions.push([
                                perm.moduleId,
                                perm.operationId,
                            ]);
                        }
                    }
                }
            }
        }

        event.response = {
            claimsOverrideDetails: {
                claimsToAddOrOverride: {
                    userPermissions: JSON.stringify(userPermissions),
                },
            },
        };
    }

    callback(error, event);
};
