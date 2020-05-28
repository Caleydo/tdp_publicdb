import { IScore, IScoreRow } from 'tdp_core/src/extensions';
import { IDataSourceConfig } from '../config';
export interface IBooleanScoreParams {
    [key: string]: any;
}
/**
 * score implementation in this case a numeric score is computed
 */
export declare abstract class ABooleanScore implements IScore<number> {
    protected readonly params: IBooleanScoreParams;
    protected readonly dataSource: IDataSourceConfig;
    /**
     * defines the IDType of which score values are returned. A score row is a pair of id and its score, e.g. {id: 'EGFR', score: 100}
     * @type {IDType}
     */
    get idType(): import("phovea_core/src/idtype").IDType;
    constructor(params: IBooleanScoreParams, dataSource: IDataSourceConfig);
    /**
     * creates the column description used within LineUp to create the oclumn
     * @returns {IAdditionalColumnDesc}
     */
    createDesc(): import("tdp_core/src/lineup").IAdditionalColumnDesc;
    /**
     * computes the actual scores and returns a Promise of IScoreRow rows
     * @returns {Promise<IScoreRow<number>[]>}
     */
    compute(): Promise<IScoreRow<number>[]>;
    protected abstract get label(): string;
    protected abstract get columnName(): string;
}
