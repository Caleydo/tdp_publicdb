/**
 * Created by sam on 16.02.2017.
 */
import { IFormSelectDesc } from 'tdp_core';
import { AExpressionVsCopyNumber, ICopyNumberDataFormatRow } from 'tdp_gene';
import { Range } from 'phovea_core';
export declare class ExpressionVsCopyNumber extends AExpressionVsCopyNumber {
    protected getParameterFormDescs(): IFormSelectDesc[];
    private get dataSource();
    loadFirstName(ensg: string): Promise<string>;
    loadData(ensg: string): Promise<ICopyNumberDataFormatRow[]>;
    protected getExpressionValues(): {
        name: string;
        value: string;
        data: import("../config").IDataSubtypeConfig;
    }[];
    protected getCopyNumberValues(): {
        name: string;
        value: string;
        data: import("../config").IDataSubtypeConfig;
    }[];
    get itemIDType(): import("phovea_core").IDType;
    protected select(range: Range): void;
}
