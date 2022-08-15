import { IViewContext, ISelection } from 'tdp_core';
import { IDataTypeConfig } from '../common/config';
import { ACombinedDependentTable } from './ACombinedDependentTable';
export declare class CombinedDependentGeneTable extends ACombinedDependentTable {
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, dataType: IDataTypeConfig[]);
    protected get oppositeDataSource(): import("../common/config").IDataSourceConfig;
    protected getParameterFormDescs(): import("tdp_core").IFormElementDesc[];
    static createCombinedDependentGeneTable(context: IViewContext, selection: ISelection, parent: HTMLElement): CombinedDependentGeneTable;
}
//# sourceMappingURL=CombinedDependentGeneTable.d.ts.map