/**
 * Created by Samuel Gratzl on 27.04.2016.
 */
import { IPluginDesc } from 'phovea_core';
import { IDataSubtypeConfig, IDataSourceConfig } from '../common/config';
import { IFormMultiMap } from 'tdp_core';
export declare class ScoreUtils {
    /**
     * creates a lineup config out of a IDataSubtypeConfig
     * @param type force a specific type
     * @param label the column label
     * @param subtype specific infos
     * @param description optional description of the column
     * @return {any}
     */
    static createDesc(type: string, label: string, subtype: IDataSubtypeConfig, description?: string): any;
    private static select;
    static selectDataSources(pluginDesc: IPluginDesc): {
        primary: IDataSourceConfig;
        opposite: IDataSourceConfig;
    };
    private static toFilterDesc;
    static toFilterString(filter: IFormMultiMap, ds: IDataSourceConfig): string;
}
