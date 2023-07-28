/**
 * Created by sam on 06.03.2017.
 */
import { IScore, INamedSet, IParams } from 'tdp_core';
import { IDType } from 'visyn_core/idtype';
import { AScore, ICommonScoreParam } from './AScore';
import { IDataSourceConfig } from '../common/config';
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
//# sourceMappingURL=AAggregatedScore.d.ts.map