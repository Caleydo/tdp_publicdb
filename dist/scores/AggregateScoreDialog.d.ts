/**
 * Created by Samuel Gratzl on 27.04.2016.
 */
import { IPluginDesc } from 'visyn_core/plugin';
import { IFormElementDesc } from 'tdp_core';
export declare class AggregateScoreDialog {
    static createScoreDialog(pluginDesc: IPluginDesc, extras: any, formDesc: IFormElementDesc[], countHint?: number): Promise<{
        [key: string]: any;
    }>;
    /**
     * hacky way to integrate a warning sign if the raw matrix is too big
     */
    private static showSizeWarning;
    static create(pluginDesc: IPluginDesc, extras: any, countHint?: number): Promise<{
        [key: string]: any;
    }>;
    static createAggregatedDepletionScoreDialog(pluginDesc: IPluginDesc, extras: any, countHint?: number): Promise<{
        [key: string]: any;
    }>;
}
//# sourceMappingURL=AggregateScoreDialog.d.ts.map