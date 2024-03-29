/**
 * Created by sam on 06.03.2017.
 */
import { IPluginDesc } from 'visyn_core/plugin';
import { IFormElementDesc } from 'tdp_core';
export declare class SingleScoreDialog {
    static createScoreDialog(pluginDesc: IPluginDesc, extra: any, formDesc: IFormElementDesc[], countHint?: number): Promise<any>;
    static create(pluginDesc: IPluginDesc, extra: any, countHint?: number): Promise<any>;
    static createSingleDepletionScoreDialog(pluginDesc: IPluginDesc, extra: any, countHint?: number): Promise<any>;
    static createSingleDrugScoreDialog(pluginDesc: IPluginDesc, extra: any, countHint?: number): Promise<any>;
}
//# sourceMappingURL=SingleScoreDialog.d.ts.map