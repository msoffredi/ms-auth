import { Module, ModuleDoc } from '../models/module';
import { Serializers } from '../models/_common';
import { RouteHandler } from '@jmsoffredi/ms-common';

export const getModulesHandler: RouteHandler = async (): Promise<ModuleDoc> => {
    return Module.serializeMany(
        await Module.scan().all().exec(),
        Serializers.RemoveTimestamps,
    );
};
