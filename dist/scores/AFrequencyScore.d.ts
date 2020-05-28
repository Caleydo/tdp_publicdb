/**
 * Created by sam on 06.03.2017.
 */
import { RangeLike } from 'phovea_core/src/range';
import IDType from 'phovea_core/src/idtype/IDType';
import { IDataSourceConfig } from '../config';
import { IScore } from 'tdp_core/src/extensions';
import { AScore, ICommonScoreParam } from './AScore';
import { INamedSet } from 'tdp_core/src/storage';
import { IParams } from 'tdp_core/src/rest';
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
