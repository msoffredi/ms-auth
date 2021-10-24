import dynamoose from 'dynamoose';
import { Document } from 'dynamoose/dist/Document';
import { Module, ModuleDoc } from './module';
import { Operation, OperationDoc } from './operation';
import { localModelOptions, Serializers, SerializersOptions } from './_common';

interface PermissionDoc extends Document {
    id: string;
    name: string;
    module: ModuleDoc;
    operation: OperationDoc;
}

const permissionSchema = new dynamoose.Schema(
    {
        id: {
            type: String,
            hashKey: true,
        },
        name: String,
        module: Module,
        operation: Operation,
    },
    {
        timestamps: true,
    },
);

const Permission = dynamoose.model<PermissionDoc>(
    'ms-auth-permissions',
    permissionSchema,
    localModelOptions,
);

Permission.methods.set('getAll', async (): Promise<PermissionDoc[]> => {
    const permissions = await Permission.scan().all().exec();

    const promises = Permission.serializeMany(
        permissions,
        Serializers.PopulateAndRemoveTimestamps,
    );

    // This code below is to resolve the fact dynamoose Model.serializeMany()
    // does not resolve promises in the Document.serialize()
    const formattedPermissions: PermissionDoc[] = [];
    if (promises instanceof Array) {
        for (const promise of promises) {
            const obj = new Permission(await promise);
            formattedPermissions.push(obj);
        }
    }

    return formattedPermissions;
});

Permission.serializer.add(
    Serializers.RemoveTimestamps,
    SerializersOptions[Serializers.RemoveTimestamps],
);

Permission.serializer.add(
    Serializers.PopulateAndRemoveTimestamps,
    SerializersOptions[Serializers.PopulateAndRemoveTimestamps],
);

export { Permission, PermissionDoc };
