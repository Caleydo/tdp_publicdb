/**
 * Created by sam on 16.02.2017.
 */
import { IScoreRow } from 'tdp_core';
import { IDataSubtypeConfig } from '../common/config';
export declare class ViewUtils {
    static loadFirstName(ensg: string): Promise<string>;
    static loadGeneList(ensgs: string[]): Promise<{
        id: string;
        symbol: string;
    }[]>;
    static postProcessScore(subType: IDataSubtypeConfig): (rows: IScoreRow<any>[]) => any[];
    static subTypeDesc(dataSubType: IDataSubtypeConfig, id: string, label: string, col?: string): import("tdp_core").IAdditionalColumnDesc;
    /**
     * Extracts ranking options from .env file (via process.env) and returns them in an object that can be spread into the ranking options.
     */
    static rankingOptionsFromEnv(): {
        enableVisPanel?: undefined;
    } | {
        enableVisPanel: any;
    };
}
//# sourceMappingURL=ViewUtils.d.ts.map