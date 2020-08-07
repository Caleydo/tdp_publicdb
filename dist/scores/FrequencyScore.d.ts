/**
 * Created by sam on 06.03.2017.
 */
import { IDataSourceConfig } from '../common/config';
import { IScore } from 'tdp_core';
import { ICommonScoreParam } from './AScore';
import { IParams } from 'tdp_core';
import { AFrequencyScore } from './AFrequencyScore';
interface IFrequencyScoreParam extends ICommonScoreParam {
    comparison_operator: string;
    comparison_value: number;
    comparison_cn?: {
        text: string;
        data: number;
    }[];
}
export declare class FrequencyScore extends AFrequencyScore implements IScore<number> {
    constructor(parameter: IFrequencyScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig, countOnly: boolean);
    protected getViewPrefix(): string;
}
export declare class FrequencyDepletionScore extends AFrequencyScore implements IScore<number> {
    constructor(parameter: IFrequencyScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig, countOnly: boolean);
    protected getViewPrefix(): string;
    protected createFilter(): IParams;
}
export {};
