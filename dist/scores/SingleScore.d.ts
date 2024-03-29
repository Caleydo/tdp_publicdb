/**
 * Created by sam on 06.03.2017.
 */
import { IPluginDesc } from 'visyn_core/plugin';
import { IScore, IParams } from 'tdp_core';
import { IDataSourceConfig } from '../common/config';
import { ASingleScore } from './ASingleScore';
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
    protected getViewPrefix(): string;
    static createScore(data: ISingleScoreParam, pluginDesc: IPluginDesc): IScore<number> | IScore<any>[];
}
export declare class SingleDepletionScore extends ASingleScore implements IScore<any> {
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
//# sourceMappingURL=SingleScore.d.ts.map