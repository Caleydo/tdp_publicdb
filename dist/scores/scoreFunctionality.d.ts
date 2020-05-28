/**
 * Created by Samuel Gratzl on 27.04.2016.
 */
import { IPluginDesc } from 'phovea_core/src/plugin';
import { IScore } from 'tdp_core/src/extensions';
import { IFormElementDesc } from 'tdp_core/src/form/interfaces';
export declare function createScoreDialog(pluginDesc: IPluginDesc, extras: any, formDesc: IFormElementDesc[], countHint?: number): any;
export declare function createScore(data: any, pluginDesc: IPluginDesc): IScore<number>;
export declare function create(pluginDesc: IPluginDesc, extras: any, countHint?: number): any;
export declare function createAggregatedDepletionScore(data: any, pluginDesc: IPluginDesc): IScore<number>;
export declare function createAggregatedDepletionScoreDialog(pluginDesc: IPluginDesc, extras: any, countHint?: number): any;
