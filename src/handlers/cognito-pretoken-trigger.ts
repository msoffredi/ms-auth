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

if (process.env.AWS_SAM_LOCAL) {
    if (process.env.DYNAMODB_URI) {
        dynamoose.aws.ddb.local(process.env.DYNAMODB_URI);
    } else {
        console.error('No local DynamoDB URL provided');
        exit(1);
    }
}

type CognitoPreTokenGenerationTriggerSources =
    | 'TokenGeneration_HostedAuth'
    | 'TokenGeneration_Authentication'
    | 'TokenGeneration_NewPasswordChallenge'
    | 'TokenGeneration_AuthenticateDevice'
    | 'TokenGeneration_RefreshTokens';

/**
 * Array of arrays of 2 string items:
 *
 * [ moduleId, operationId ]
 */
type UserPermissionsType = [string, string][];

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
    } else if (!userAttributes['custom:userId']) {
        console.log('custom:userId missing', userAttributes);
        error = 'User id (custom:userId) is missing in user attributes';
    } else {
        const userPermissions: UserPermissionsType = [];
        const user = await User.get(userAttributes['custom:userId']);

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
