/**
 * Created by sam on 06.03.2017.
 */
import { IDataSubtypeConfig, IDataSourceConfig } from '../common/config';
import { IPluginDesc } from 'phovea_core';
import { IFormMultiMap } from 'tdp_core';
/**
 * creates a lineup config out of a IDataSubtypeConfig
 * @param type force a specific type
 * @param label the column label
 * @param subtype specific infos
 * @param description optional description of the column
 * @return {any}
 */
export declare function createDesc(type: string, label: string, subtype: IDataSubtypeConfig, description?: string): any;
export declare function selectDataSources(pluginDesc: IPluginDesc): {
    primary: IDataSourceConfig;
    opposite: IDataSourceConfig;
};
export declare function toFilterString(filter: IFormMultiMap, ds: IDataSourceConfig): any;
