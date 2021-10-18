import { APIGatewayProxyEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { DatabaseError } from '../errors/database-error';
import { RequestValidationError } from '../errors/request-validation-error';
import { Module } from '../models/module';
import { Operation } from '../models/operation';
import { Permission, PermissionDoc } from '../models/permission';
import { Serializers } from '../models/_common';

export const postPermissionsHandler = async (
    event: APIGatewayProxyEvent,
): Promise<PermissionDoc> => {
    const errors = [];

    if (!event.body) {
        throw new RequestValidationError([
            {
                message:
                    'You need to provide a name, operation_id, and module_id to create a permission',
            },
        ]);
    }

    const request = JSON.parse(event.body);

    if (!request.name) {
        errors.push({
            message: 'Name field missing in provided body',
            field: 'name',
        });
    }

    if (!request.operation_id) {
        errors.push({
            message: 'Operation id field missing in provided body',
            field: 'operation_id',
        });
    }

    if (!request.module_id) {
        errors.push({
            message: 'Module id field missing in provided body',
            field: 'module_id',
        });
    }

    if (errors.length) {
        throw new RequestValidationError(errors);
    }

    // Validate operation id
    const operation = await Operation.get(request.operation_id);
    if (!operation) {
        throw new DatabaseError('The operation id provided was not found');
    }

    // Validate module_id
    const module = await Module.get(request.module_id);
    if (!module) {
        throw new DatabaseError('The module id provided was not found');
    }

    const id = request.id ?? randomUUID();
    const newPermission = await Permission.create({
        id,
        name: request.name,
        module,
        operation,
    });

    return new Permission(
        await newPermission.serialize(Serializers.PopulateAndRemoveTimestamps),
    );
};
