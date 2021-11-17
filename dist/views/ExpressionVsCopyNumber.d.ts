/**
 * Created by sam on 16.02.2017.
 */
import { IFormElementDesc } from 'tdp_core';
import { AExpressionVsCopyNumber, ICopyNumberDataFormatRow } from 'tdp_gene';
import { Range } from 'phovea_core';
export declare class ExpressionVsCopyNumber extends AExpressionVsCopyNumber {
    protected getParameterFormDescs(): IFormElementDesc[];
    private get dataSource();
    loadFirstName(ensg: string): Promise<string>;
    loadData(ensg: string): Promise<ICopyNumberDataFormatRow[]>;
    protected getExpressionValues(): {
        name: string;
        value: string;
        data: import("../common/config").IDataSubtypeConfig;
    }[];
    protected getCopyNumberValues(): {
        name: string;
        value: string;
        data: import("../common/config").IDataSubtypeConfig;
    }[];
    get itemIDType(): import("phovea_core").IDType;
    protected select(range: Range): void;
}
