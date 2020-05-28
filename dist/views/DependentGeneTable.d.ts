/**
 * Created by Marc Streit on 28.07.2016.
 */
import { ARankingView } from 'tdp_core';
import { IDataTypeConfig } from '../config';
import { ISelection, IViewContext } from 'tdp_core';
import { IServerColumn } from 'tdp_core';
export declare class DependentGeneTable extends ARankingView {
    private readonly dataType;
    private readonly dataSource;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, dataType: IDataTypeConfig, options?: {});
    protected getParameterFormDescs(): import("tdp_core/dist/form/interfaces").IFormElementDesc[];
    protected parameterChanged(name: string): void;
    protected loadColumnDesc(): Promise<Readonly<import("tdp_core/dist/base/rest").IDatabaseViewDesc>>;
    protected createSelectionAdapter(): import("tdp_core/dist/lineup/selection/ISelectionAdapter").ISelectionAdapter;
    protected getColumnDescs(columns: IServerColumn[]): import("tdp_core/dist/base/interfaces").IAdditionalColumnDesc[];
    protected loadRows(): Promise<import("tdp_core/dist/base/rest").IRow[]>;
    private get dataSubType();
    private loadSelectionColumnData;
}
export declare function createExpressionDependentGeneTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): DependentGeneTable;
export declare function createCopyNumberDependentGeneTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): DependentGeneTable;
export declare function createMutationDependentGeneTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): DependentGeneTable;
