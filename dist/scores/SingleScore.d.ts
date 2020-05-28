/**
 * Created by sam on 06.03.2017.
 */
import { IDataSourceConfig } from '../common/config';
import { IScore } from 'tdp_core';
import { IFormElementDesc } from 'tdp_core';
import { IPluginDesc } from 'phovea_core';
import { ASingleScore } from './ASingleScore';
interface ISingleScoreParam {
    name: {
        id: string;
        text: string;
    };
    data_type: string;
    data_subtype: string;
    /**
     * see config.MAX_FILTER_SCORE_ROWS_BEFORE_ALL maximal number of rows for computing limiting the score to this subset
     */
    maxDirectFilterRows?: number;
}
export declare function createScoreDialog(pluginDesc: IPluginDesc, extra: any, formDesc: IFormElementDesc[], countHint?: number): Promise<any>;
export declare function initializeScore(data: ISingleScoreParam, pluginDesc: IPluginDesc, singleScoreFactory: (parameter: ISingleScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig) => ASingleScore): IScore<number> | IScore<any>[];
export declare function create(pluginDesc: IPluginDesc, extra: any, countHint?: number): Promise<any>;
export declare function createScore(data: ISingleScoreParam, pluginDesc: IPluginDesc): IScore<number> | IScore<any>[];
export declare function createSingleDepletionScoreDialog(pluginDesc: IPluginDesc, extra: any, countHint?: number): Promise<any>;
export declare function createSingleDepletionScore(data: ISingleScoreParam, pluginDesc: IPluginDesc): IScore<number> | IScore<any>[];
export {};
