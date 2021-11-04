/**
 * Created by sam on 06.03.2017.
 */
import { IDataSourceConfig } from '../common/config';
import { IScore } from 'tdp_core';
import { IPluginDesc } from 'tdp_core';
import { ASingleScore } from './ASingleScore';
import { IParams } from 'tdp_core';
interface ISingleScoreParam {
    name: {
        id: string;
        text: string;
    };
    data_type: string;
    data_subtype: string;
    screen_type?: string;
    /**
     * see config.MAX_FILTER_SCORE_ROWS_BEFORE_ALL maximal number of rows for computing limiting the score to this subset
     */
    maxDirectFilterRows?: number;
}
export declare class SingleScore extends ASingleScore implements IScore<any> {
    constructor(parameter: ISingleScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig);
    protected getViewPrefix(): string;
    static createScore(data: ISingleScoreParam, pluginDesc: IPluginDesc): IScore<number> | IScore<any>[];
}
export declare class SingleDepletionScore extends ASingleScore implements IScore<any> {
    constructor(parameter: ISingleScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig);
    protected getViewPrefix(): string;
    protected createFilter(): IParams;
    static createSingleDepletionScore(data: ISingleScoreParam, pluginDesc: IPluginDesc): IScore<number> | IScore<any>[];
}
export declare class SingleDrugScore extends ASingleScore implements IScore<any> {
    private readonly drugscreen;
    constructor(parameter: ISingleScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig);
    protected getViewPrefix(): string;
    protected createFilter(): IParams;
    static createSingleDrugScore(data: ISingleScoreParam, pluginDesc: IPluginDesc): IScore<number> | IScore<any>[];
}
export {};
