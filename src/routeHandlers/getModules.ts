import { Module, ModuleDoc } from '../models/module';
import { Serializers } from '../models/_common';

export const getModulesHandler = async (): Promise<ModuleDoc> => {
    return Module.serializeMany(
        await Module.scan().all().exec(),
        Serializers.RemoveTimestamps,
    );
};
