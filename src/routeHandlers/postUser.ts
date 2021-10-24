import { APIGatewayProxyEvent } from 'aws-lambda';
import { DatabaseError } from '../errors/database-error';
import { RequestValidationError } from '../errors/request-validation-error';
import { Role, RoleDoc } from '../models/role';
import { User, UserDoc } from '../models/user';
import { Serializers } from '../models/_common';

export const postUserHandler = async (
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
    }

    if (errors.length) {
        throw new RequestValidationError(errors);
    }

    // Validate roles and prepare them for the INSERT
    const roleDocs: RoleDoc[] = [];
    for (const role of roles) {
        const roleDoc = await Role.get(role.id);
        if (!roleDoc) {
            throw new DatabaseError(`Role with id ${role.id} was not found.`);
        }
        roleDocs.push(roleDoc);
    }

    const newUser = await User.create({
        id: request.id,
        roles: roleDocs,
    });

    return new User(
        await newUser.serialize(Serializers.PopulateAndRemoveTimestamps),
    );
};
