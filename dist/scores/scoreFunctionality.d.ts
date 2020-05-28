/**
 * Created by Samuel Gratzl on 27.04.2016.
 */
import { IPluginDesc } from 'phovea_core';
import { IScore } from 'tdp_core';
import { IFormElementDesc } from 'tdp_core';
export declare function createScoreDialog(pluginDesc: IPluginDesc, extras: any, formDesc: IFormElementDesc[], countHint?: number): Promise<{
    [key: string]: any;
}>;
export declare function createScore(data: any, pluginDesc: IPluginDesc): IScore<number>;
export declare function create(pluginDesc: IPluginDesc, extras: any, countHint?: number): Promise<{
    [key: string]: any;
}>;
export declare function createAggregatedDepletionScore(data: any, pluginDesc: IPluginDesc): IScore<number>;
export declare function createAggregatedDepletionScoreDialog(pluginDesc: IPluginDesc, extras: any, countHint?: number): Promise<{
    [key: string]: any;
}>;
