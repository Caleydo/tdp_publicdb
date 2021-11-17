/**
 * Created by sam on 06.03.2017.
 */
import { IDataSourceConfig } from '../common/config';
import { IScore } from 'tdp_core';
import { ICommonScoreParam } from './AScore';
import { IParams } from 'tdp_core';
import { AAggregatedScore } from './AAggregatedScore';
import { IPluginDesc } from 'tdp_core';
import { AFrequencyScore } from './AFrequencyScore';
interface IAggregatedScoreParam extends ICommonScoreParam {
    aggregation: string;
}
export declare class AggregatedScore extends AAggregatedScore implements IScore<number> {
    constructor(parameter: IAggregatedScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig);
    protected getViewPrefix(): string;
    static createAggregationFrequencyScore(data: any, pluginDesc: IPluginDesc): IScore<number>;
    static initializeAggregationFrequencyScore(data: any, pluginDesc: IPluginDesc, aggregatedScoreFactory: (data: any, primary: IDataSourceConfig, opposite: IDataSourceConfig) => AAggregatedScore, frequencyScoreFactory: (data: any, primary: IDataSourceConfig, opposite: IDataSourceConfig, countOnly: boolean) => AFrequencyScore): AAggregatedScore | AFrequencyScore;
}
export declare class AggregatedDepletionScore extends AAggregatedScore implements IScore<number> {
    constructor(parameter: IAggregatedScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig);
    protected getViewPrefix(): string;
    protected createFilter(): IParams;
    static createAggregatedDepletionScore(data: any, pluginDesc: IPluginDesc): IScore<number>;
}
export {};
