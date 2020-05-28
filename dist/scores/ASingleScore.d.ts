/**
 * Created by sam on 06.03.2017.
 */
import { RangeLike } from 'phovea_core/src/range';
import { IDType } from 'phovea_core/src/idtype';
import { IDataSourceConfig } from '../config';
import { IScore } from 'tdp_core/src/extensions';
import { AScore } from './AScore';
import { INamedSet } from 'tdp_core/src/storage';
import { IParams } from 'tdp_core/src/rest';
interface ISingleScoreParam {
    name: {
        id: string;
        text: string;
    };
    data_type: string;
    data_subtype: string;
    /**
     * see config.MAX_FILTER_SCORE_ROWS_BEFORE_ALL maximal number of rows for computing limiting the score to this subset
     */
    maxDirectFilterRows?: number;
}
export declare abstract class ASingleScore extends AScore implements IScore<any> {
    private parameter;
    private readonly dataSource;
    private readonly oppositeDataSource;
    constructor(parameter: ISingleScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig);
    get idType(): IDType;
    createDesc(): any;
    protected createFilter(): IParams;
    compute(ids: RangeLike, idtype: IDType, namedSet?: INamedSet): Promise<any[]>;
    protected abstract getViewPrefix(): string;
}
export {};
