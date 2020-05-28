import { IViewContext, ISelection } from 'tdp_core/src/views';
import { IDataTypeConfig } from '../config';
import { ACombinedDependentTable } from './ACombinedDependentTable';
export declare class CombinedDependentGeneTable extends ACombinedDependentTable {
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, dataType: IDataTypeConfig[]);
    protected get oppositeDataSource(): import("../config").IDataSourceConfig;
    protected getParameterFormDescs(): import("tdp_core/src/form").IFormElementDesc[];
}
export declare function createCombinedDependentGeneTable(context: IViewContext, selection: ISelection, parent: HTMLElement): CombinedDependentGeneTable;
