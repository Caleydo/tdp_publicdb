/**
 * Created by Marc Streit on 26.07.2016.
 */
import { ARankingView } from 'tdp_core';
import { IDataTypeConfig } from '../config';
import { ISelection, IViewContext } from 'tdp_core';
import { IServerColumn } from 'tdp_core';
export declare class DependentSampleTable extends ARankingView {
    private readonly dataType;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, dataType: IDataTypeConfig, options?: {});
    protected getParameterFormDescs(): import("tdp_core/dist/form/interfaces").IFormElementDesc[];
    get itemIDType(): import("phovea_core").IDType;
    private get dataSource();
    private get dataSubType();
    protected parameterChanged(name: string): void;
    protected loadColumnDesc(): Promise<Readonly<import("tdp_core/dist/base/rest").IDatabaseViewDesc>>;
    protected createSelectionAdapter(): import("tdp_core/dist/lineup/selection/ISelectionAdapter").ISelectionAdapter;
    protected getColumnDescs(columns: IServerColumn[]): import("tdp_core/dist/base/interfaces").IAdditionalColumnDesc[];
    protected loadRows(): Promise<import("tdp_core/dist/base/rest").IRow[]>;
    private loadSelectionColumnData;
}
export declare function createExpressionDependentSampleTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): DependentSampleTable;
export declare function createCopyNumberDependentSampleTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): DependentSampleTable;
export declare function createMutationDependentSampleTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): DependentSampleTable;
