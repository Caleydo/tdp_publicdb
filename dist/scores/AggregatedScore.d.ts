/**
 * Created by sam on 06.03.2017.
 */
import { IPluginDesc } from 'visyn_core/plugin';
import { IScore, IParams } from 'tdp_core';
import { IDataSourceConfig } from '../common/config';
import { AAggregatedScore } from './AAggregatedScore';
import { AFrequencyScore } from './AFrequencyScore';
export declare class AggregatedScore extends AAggregatedScore implements IScore<number> {
    protected getViewPrefix(): string;
    static createAggregationFrequencyScore(data: any, pluginDesc: IPluginDesc): IScore<number>;
    static initializeAggregationFrequencyScore(data: any, pluginDesc: IPluginDesc, aggregatedScoreFactory: (data: any, primary: IDataSourceConfig, opposite: IDataSourceConfig) => AAggregatedScore, frequencyScoreFactory: (data: any, primary: IDataSourceConfig, opposite: IDataSourceConfig, countOnly: boolean) => AFrequencyScore): AAggregatedScore | AFrequencyScore;
}
export declare class AggregatedDepletionScore extends AAggregatedScore implements IScore<number> {
    protected getViewPrefix(): string;
    protected createFilter(): IParams;
    static createAggregatedDepletionScore(data: any, pluginDesc: IPluginDesc): IScore<number>;
}
//# sourceMappingURL=AggregatedScore.d.ts.map