import { IScore, IScoreRow, INamedSet } from 'tdp_core';
import { IDataSourceConfig } from '../common/config';
import { RangeLike, IDType } from 'phovea_core';
import { IPluginDesc } from 'phovea_core';
/**
 * Interface describing the parameter needed for a `Gene Signature Score`.
 */
interface IGeneSignatureParam {
    signature: string;
}
/**
 * `Gene Signature Score` options.
 */
interface IGeneSignatureOptions {
    description: string;
}
/**
 * Data returned from the Gene Signature Dialog.
 */
interface IGeneSignatureData {
    params: IGeneSignatureParam;
    options: IGeneSignatureOptions;
}
/**
 * Score implementation
 */
export declare class GeneSignatureScore implements IScore<number> {
    protected readonly params: IGeneSignatureParam;
    protected readonly dataSource: IDataSourceConfig;
    protected options?: IGeneSignatureOptions;
    constructor(params: IGeneSignatureParam, dataSource: IDataSourceConfig, options?: IGeneSignatureOptions);
    /**
     * Defines the IDType of which score values are returned. A score row is a pair of id and its score, e.g. {id: 'EGFR', score: 100}
     * @type {IDType}
     */
    get idType(): IDType;
    /**
     * Creates the column description used within LineUp to create the oclumn
     * @returns {IAdditionalColumnDesc}
     */
    createDesc(): import("tdp_core").IAdditionalColumnDesc;
    /**
     * Computes the actual scores and returns a Promise of IScoreRow rows.
     * @returns {Promise<IScoreRow<number>[]>}
     */
    compute(ids: RangeLike, idtype: IDType, namedSet?: INamedSet): Promise<IScoreRow<number>[]>;
    static createGeneSignatureScore(data: IGeneSignatureData | IGeneSignatureData[], pluginDesc: IPluginDesc): GeneSignatureScore[];
    /**
     * Builder function for building the parameters of the score.
     * @returns {Promise<ISignatureColumnParam>} a promise for the parameter.
     */
    static createGeneSignatureDialog(pluginDesc: IPluginDesc): Promise<IGeneSignatureData[]>;
}
export {};
