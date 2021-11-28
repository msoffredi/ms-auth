import { APIGatewayProxyEvent } from 'aws-lambda';
import {
    DatabaseError,
    RequestValidationError,
    Serializers,
} from '@jmsoffredi/ms-common';
import { Permission, PermissionDoc } from '../models/permission';

export const getOnePermissionHandler = async (
    event: APIGatewayProxyEvent,
): Promise<PermissionDoc> => {
    if (!event.pathParameters || !event.pathParameters.id) {
        throw new RequestValidationError([
            {
                message: 'Id missing in URL or invalid',
                field: 'id',
            },
        ]);
    }

    const { id } = event.pathParameters;

    const permission = await Permission.get(id);

    if (!permission) {
        throw new DatabaseError(`Could not retrieve permission with id: ${id}`);
    }

    return new Permission(
        await permission.serialize(Serializers.RemoveTimestamps),
    );
};
