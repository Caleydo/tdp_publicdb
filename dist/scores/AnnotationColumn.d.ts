import { IPluginDesc } from 'visyn_core/plugin';
import { IScore } from 'tdp_core';
import { ABooleanScore, IBooleanScoreParams } from './ABooleanScore';
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
    protected get label(): string;
    protected get columnName(): string;
    static createAnnotationColumnScore(data: IAnnotationColumnParam | IAnnotationColumnParam[], pluginDesc: IPluginDesc): AnnotationColumn[];
    /**
     * builder function for building the parameters of the score
     * @returns {Promise<IAnnotationColumnParam>} a promise for the parameter
     */
    static createAnnotationColumn(pluginDesc: IPluginDesc): Promise<IAnnotationColumnParam[]>;
}
//# sourceMappingURL=AnnotationColumn.d.ts.map