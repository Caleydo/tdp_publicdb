/**
 * Created by sam on 16.02.2017.
 */
import { IScoreRow } from 'tdp_core';
import { IDataSubtypeConfig } from '../common/config';
export declare function loadFirstName(ensg: string): Promise<string>;
export declare function loadGeneList(ensgs: string[]): Promise<{
    id: string;
    symbol: string;
    _id: number;
}[]>;
export declare function postProcessScore(subType: IDataSubtypeConfig): (rows: IScoreRow<any>[]) => any[];
export declare function subTypeDesc(dataSubType: IDataSubtypeConfig, id: number, label: string, col?: string): import("tdp_core").IAdditionalColumnDesc;
