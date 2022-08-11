/**
 * Created by sam on 06.03.2017.
 */
import { IDataTypeConfig, IDataSubtypeConfig } from '../common/config';
export interface IScoreFilter {
    name: string | string[];
    names: string | string[];
    panel: string | string[];
    strand: string | string[];
    biotype: string | string[];
}
export interface ICommonScoreParam {
    data_type: string;
    data_subtype: string;
    filter: IScoreFilter;
    /**
     * see config.MAX_FILTER_SCORE_ROWS_BEFORE_ALL maximal number of rows for computing limiting the score to this subset
     */
    maxDirectFilterRows?: number;
}
export declare class AScore {
    protected readonly dataType: IDataTypeConfig;
    protected readonly dataSubType: IDataSubtypeConfig;
    constructor(parameter: {
        data_type: string;
        data_subtype: string;
    });
}
//# sourceMappingURL=AScore.d.ts.map