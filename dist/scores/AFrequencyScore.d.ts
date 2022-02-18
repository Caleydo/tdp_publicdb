/**
 * Created by sam on 06.03.2017.
 */
import { RangeLike, IDType, IScore, INamedSet, IParams } from 'tdp_core';
import { AScore, ICommonScoreParam } from './AScore';
import { IDataSourceConfig } from '../common/config';
interface IFrequencyScoreParam extends ICommonScoreParam {
    comparison_operator: string;
    comparison_value: number;
    comparison_cn?: {
        text: string;
        data: number;
    }[];
}
export declare abstract class AFrequencyScore extends AScore implements IScore<number> {
    private readonly parameter;
    private readonly dataSource;
    private readonly oppositeDataSource;
    private readonly countOnly;
    constructor(parameter: IFrequencyScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig, countOnly: boolean);
    get idType(): IDType;
    createDesc(): any;
    compute(ids: RangeLike, idtype: IDType, namedSet?: INamedSet): Promise<any[]>;
    protected createFilter(): IParams;
    protected abstract getViewPrefix(): string;
}
export {};
//# sourceMappingURL=AFrequencyScore.d.ts.map