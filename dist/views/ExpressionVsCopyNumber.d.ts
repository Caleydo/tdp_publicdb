import { IFormElementDesc } from 'tdp_core';
import { AExpressionVsCopyNumber, ICopyNumberDataFormatRow } from './AExpressionVsCopyNumber';
export declare class ExpressionVsCopyNumber extends AExpressionVsCopyNumber {
    protected getParameterFormDescs(): IFormElementDesc[];
    private get dataSource();
    loadFirstName(ensg: string): Promise<string>;
    loadData(ensg: string): Promise<ICopyNumberDataFormatRow[]>;
    protected getExpressionValues(): {
        name: string;
        value: string;
        data: import("../common").IDataSubtypeConfig;
    }[];
    protected getCopyNumberValues(): {
        name: string;
        value: string;
        data: import("../common").IDataSubtypeConfig;
    }[];
    get itemIDType(): import("visyn_core/idtype").IDType;
    protected select(ids: string[]): void;
}
//# sourceMappingURL=ExpressionVsCopyNumber.d.ts.map