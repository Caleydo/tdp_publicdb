import { IScore } from 'tdp_core/src/extensions';
import { ABooleanScore, IBooleanScoreParams } from './ABooleanScore';
import { IDataSourceConfig } from '../config';
import { IPluginDesc } from 'phovea_core/src/plugin';
/**
 * interface describing the parameter needed for MyScore
 */
export interface IAnnotationColumnParam extends IBooleanScoreParams {
    panel: string;
}
/**
 * score implementation in this case a numeric score is computed
 */
export declare class AnnotationColumn extends ABooleanScore implements IScore<number> {
    constructor(params: IAnnotationColumnParam, dataSource: IDataSourceConfig);
    protected get label(): string;
    protected get columnName(): string;
}
export declare function createAnnotationColumnScore(data: any, pluginDesc: IPluginDesc): AnnotationColumn;
/**
 * builder function for building the parameters of the score
 * @returns {Promise<IAnnotationColumnParam>} a promise for the parameter
 */
export declare function createAnnotationColumn(pluginDesc: IPluginDesc): Promise<IAnnotationColumnParam>;
