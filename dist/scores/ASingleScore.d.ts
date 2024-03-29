/**
 * Created by sam on 06.03.2017.
 */
import { IDType } from 'visyn_core/idtype';
import { IScore, INamedSet, IParams } from 'tdp_core';
import { AScore } from './AScore';
import { IDataSourceConfig } from '../common/config';
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
//# sourceMappingURL=ASingleScore.d.ts.map