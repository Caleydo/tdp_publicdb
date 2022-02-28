/**
 * Created by sam on 16.02.2017.
 */
import { IFormElementDesc, Range } from 'tdp_core';
import { AExpressionVsCopyNumber, ICopyNumberDataFormatRow } from 'tdp_gene';
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
    get itemIDType(): import("tdp_core").IDType;
    protected select(range: Range): void;
}
//# sourceMappingURL=ExpressionVsCopyNumber.d.ts.map