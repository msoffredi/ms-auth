import { DeepPartial, ObjectType } from 'dynamoose/dist/General';
import { ModelOptions } from 'dynamoose/dist/Model';

const localModelOptions: DeepPartial<ModelOptions> = {
    create: false,
    waitForActive: false,
};

if (process.env.AWS_SAM_LOCAL) {
    localModelOptions.create = true;
}

enum Serializers {
    RemoveTimestamps = 'removeTimeStamps',
    PopulateAndRemoveTimestamps = 'populateAndRemoveTimestamps',
}

const SerializersOptions = {
    [Serializers.RemoveTimestamps]: { exclude: ['createdAt', 'updatedAt'] },
    [Serializers.PopulateAndRemoveTimestamps]: {
        modify: async (
            _serialized: ObjectType,
            original: ObjectType,
        ): Promise<ObjectType> => {
            // First we populate any object we have
            const populatedObject = await original.populate();

            // Second we serialize filtering timestamps out of the permission document
            const serializedObject = populatedObject.serialize(
                Serializers.RemoveTimestamps,
            );

            // Third we strip timestamps from any populated object field (1 level)
            for (const property in serializedObject) {
                if (
                    typeof serializedObject[property] === 'object' &&
                    serializedObject[property].createdAt
                ) {
                    serializedObject[property].createdAt = undefined;
                    serializedObject[property].updatedAt = undefined;
                }
            }

            // Finally, we return a new document with the result
            return serializedObject;
        },
    },
};

export { localModelOptions, Serializers, SerializersOptions };
