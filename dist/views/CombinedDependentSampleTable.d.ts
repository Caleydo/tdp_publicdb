import { IViewContext, ISelection } from 'tdp_core';
import { IDataTypeConfig, IDataSourceConfig } from '../config';
import { ACombinedDependentTable } from './ACombinedDependentTable';
export declare class CombinedDependentSampleTable extends ACombinedDependentTable {
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, dataType: IDataTypeConfig[]);
    protected get oppositeDataSource(): IDataSourceConfig;
    protected getParameterFormDescs(): import("tdp_core").IFormElementDesc[];
    protected parameterChanged(name: string): void;
    protected getSelectionColumnLabel(ensg: string): Promise<string>;
}
export declare function createCombinedDependentSampleTable(context: IViewContext, selection: ISelection, parent: HTMLElement): CombinedDependentSampleTable;
