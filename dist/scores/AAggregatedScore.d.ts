import { IDataSourceConfig } from '../common/config';
import { IScore } from 'tdp_core';
import { AScore, ICommonScoreParam } from './AScore';
import { INamedSet } from 'tdp_core';
import { IParams } from 'tdp_core';
import { IDType } from 'tdp_core';
interface IAggregatedScoreParam extends ICommonScoreParam {
    aggregation: string;
}
export declare abstract class AAggregatedScore extends AScore implements IScore<number> {
    private readonly parameter;
    private readonly dataSource;
    private readonly oppositeDataSource;
    constructor(parameter: IAggregatedScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig);
    get idType(): IDType;
    createDesc(): any;
    compute(ids: string[], idtype: IDType, namedSet?: INamedSet): Promise<any[]>;
    protected abstract getViewPrefix(): string;
    protected createFilter(): IParams;
}
export {};
