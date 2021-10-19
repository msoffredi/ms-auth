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
            // for (const property in serializedObject) {
            //     if (typeof serializedObject[property] === 'object') {
            //         if (serializedObject[property].createdAt) {
            //             serializedObject[property].createdAt = undefined;
            //             serializedObject[property].updatedAt = undefined;
            //         } else if (serializedObject[property] instanceof Array) {
            //         }
            //     }
            // }

            // Finally, we return a new document with the result
            return cleanTimestampsFromObj(serializedObject);
        },
    },
};

/**
 * This function use recursion to clean an object and strip out any
 * createdAt and updatedAt fields from the object structure.
 *
 * It does not support multidimensional arrays (not needed at this time)
 *
 * @param obj Object to be processed
 * @returns clean version of the object
 */
const cleanTimestampsFromObj = (obj: ObjectType): ObjectType => {
    const newObj = { ...obj };
    for (const key of Object.keys(obj)) {
        if (key === 'createdAt' || key === 'updatedAt') {
            delete newObj[key];
        } else if (typeof obj[key] === 'object') {
            if (obj[key] instanceof Array) {
                newObj[key] = obj[key].map((item: unknown) => {
                    if (item && typeof item === 'object') {
                        return cleanTimestampsFromObj(item);
                    }
                    return item;
                });
            } else {
                newObj[key] = cleanTimestampsFromObj(obj[key]);
            }
        }
    }
    return newObj;
};

export { localModelOptions, Serializers, SerializersOptions };
