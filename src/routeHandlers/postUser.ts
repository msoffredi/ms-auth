import { APIGatewayProxyEvent } from 'aws-lambda';
import { RequestValidationError, RouteHandler } from '@jmsoffredi/ms-common';
import { Role } from '../models/role';
import { User, UserDoc } from '../models/user';
import { Serializers } from '../models/_common';

export const postUserHandler: RouteHandler = async (
    event: APIGatewayProxyEvent,
): Promise<UserDoc> => {
    const errors = [];

    if (!event.body) {
        throw new RequestValidationError([
            {
                message:
                    'You need to provide a user id and an array of roles to create a user',
            },
        ]);
    }

    const request = JSON.parse(event.body);

    if (!request.id || request.id.trim() === '') {
        errors.push({
            message: 'User id is missing in provided body',
            field: 'id',
        });
    }

    if (!request.roles) {
        errors.push({
            message: 'Roles array field missing in provided body',
            field: 'roles',
        });
    }

    const { roles } = request;
    if (!(roles instanceof Array) || roles.length === 0) {
        errors.push({
            message: 'Roles array field invalid or empty',
            field: 'roles',
        });
    } else {
        // Validate roles and prepare them for the INSERT
        for (const role of roles) {
            const roleDoc = await Role.get(role);
            if (!roleDoc) {
                errors.push({
                    message: `Role with id ${role} was not found.`,
                    field: 'roles',
                });
            }
        }
    }

    if (errors.length) {
        throw new RequestValidationError(errors);
    }

    const newUser = await User.create({
        id: request.id,
        roles: roles,
    });

    return new User(await newUser.serialize(Serializers.RemoveTimestamps));
};
