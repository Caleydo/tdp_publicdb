/**
 * Created by sam on 06.03.2017.
 */
import { IDataSourceConfig } from '../config';
import { IScore } from 'tdp_core';
import { ICommonScoreParam } from './AScore';
import { IParams } from 'tdp_core';
import { AAggregatedScore } from './AAggregatedScore';
interface IAggregatedScoreParam extends ICommonScoreParam {
    aggregation: string;
}
export declare class AggregatedScore extends AAggregatedScore implements IScore<number> {
    constructor(parameter: IAggregatedScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig);
    protected getViewPrefix(): string;
}
export declare class AggregatedDepletionScore extends AAggregatedScore implements IScore<number> {
    constructor(parameter: IAggregatedScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig);
    protected getViewPrefix(): string;
    protected createFilter(): IParams;
}
export {};
