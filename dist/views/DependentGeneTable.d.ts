/**
 * Created by Marc Streit on 28.07.2016.
 */
import { ARankingView, IARankingViewOptions } from 'tdp_core';
import { IDataTypeConfig } from '../common/config';
import { ISelection, IViewContext } from 'tdp_core';
import { IServerColumn } from 'tdp_core';
export declare class DependentGeneTable extends ARankingView {
    private readonly dataType;
    private readonly dataSource;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, dataType: IDataTypeConfig, options?: Partial<IARankingViewOptions>);
    protected getParameterFormDescs(): import("tdp_core").IFormElementDesc[];
    protected parameterChanged(name: string): void;
    protected loadColumnDesc(): Promise<Readonly<import("tdp_core").IDatabaseViewDesc>>;
    protected createSelectionAdapter(): import("tdp_core").ISelectionAdapter;
    protected getColumnDescs(columns: IServerColumn[]): import("tdp_core").IAdditionalColumnDesc[];
    protected loadRows(): Promise<import("tdp_core").IRow[]>;
    private get dataSubType();
    private loadSelectionColumnData;
    static createExpressionDependentGeneTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): DependentGeneTable;
    static createCopyNumberDependentGeneTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): DependentGeneTable;
    static createMutationDependentGeneTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): DependentGeneTable;
}
