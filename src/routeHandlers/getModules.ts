import { Module, ModuleDoc } from '../models/module';
import { RouteHandler, Serializers } from '@jmsoffredi/ms-common';

export const getModulesHandler: RouteHandler = async (): Promise<ModuleDoc> => {
    return Module.serializeMany(
        await Module.scan().all().exec(),
        Serializers.RemoveTimestamps,
    );
};
