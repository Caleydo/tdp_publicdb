/**
 * Created by Marc Streit on 26.07.2016.
 */
import { ARankingView, IARankingViewOptions } from 'tdp_core';
import { IDataTypeConfig } from '../common/config';
import { ISelection, IViewContext } from 'tdp_core';
import { IServerColumn } from 'tdp_core';
export declare class DependentSampleTable extends ARankingView {
    private readonly dataType;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, dataType: IDataTypeConfig, options?: Partial<IARankingViewOptions>);
    protected getParameterFormDescs(): import("tdp_core").IFormElementDesc[];
    get itemIDType(): import("tdp_core").IDType;
    private get dataSource();
    private get dataSubType();
    protected parameterChanged(name: string): Promise<unknown>;
    protected loadColumnDesc(): Promise<Readonly<import("tdp_core").IDatabaseViewDesc>>;
    protected createSelectionAdapter(): import("tdp_core").ISelectionAdapter;
    protected getColumnDescs(columns: IServerColumn[]): import("tdp_core").IAdditionalColumnDesc[];
    protected loadRows(): Promise<import("tdp_core").IRow[]>;
    private loadSelectionColumnData;
    static createExpressionDependentSampleTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): DependentSampleTable;
    static createCopyNumberDependentSampleTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): DependentSampleTable;
    static createMutationDependentSampleTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): DependentSampleTable;
}
