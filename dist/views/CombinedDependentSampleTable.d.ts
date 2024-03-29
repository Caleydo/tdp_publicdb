import { IViewContext, ISelection } from 'tdp_core';
import { IDataTypeConfig, IDataSourceConfig } from '../common/config';
import { ACombinedDependentTable } from './ACombinedDependentTable';
export declare class CombinedDependentSampleTable extends ACombinedDependentTable {
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, dataType: IDataTypeConfig[]);
    protected get oppositeDataSource(): IDataSourceConfig;
    protected getParameterFormDescs(): import("tdp_core").IFormElementDesc[];
    protected parameterChanged(name: string): Promise<void>;
    protected getSelectionColumnLabel(ensg: string): Promise<string>;
    static createCombinedDependentSampleTable(context: IViewContext, selection: ISelection, parent: HTMLElement): CombinedDependentSampleTable;
}
//# sourceMappingURL=CombinedDependentSampleTable.d.ts.map