import { IDType } from 'tdp_core';
import { IDataSourceConfig } from '../common/config';
import { IScore } from 'tdp_core';
import { AScore } from './AScore';
import { INamedSet } from 'tdp_core';
import { IParams } from 'tdp_core';
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
export declare abstract class ASingleScore extends AScore implements IScore<any> {
    private parameter;
    private readonly dataSource;
    private readonly oppositeDataSource;
    constructor(parameter: ISingleScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig);
    get idType(): IDType;
    createDesc(): any;
    protected createFilter(): IParams;
    compute(ids: string[], idtype: IDType, namedSet?: INamedSet): Promise<any[]>;
    protected abstract getViewPrefix(): string;
}
export {};
