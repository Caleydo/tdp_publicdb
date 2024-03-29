/**
 * Created by Marc Streit on 26.07.2016.
 */
import { IServerColumn } from 'visyn_core/base';
import { ARankingView, IARankingViewOptions, ISelection, IViewContext } from 'tdp_core';
import { IDataTypeConfig } from '../common/config';
export declare class DependentSampleTable extends ARankingView {
    private readonly dataType;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, dataType: IDataTypeConfig, options?: Partial<IARankingViewOptions>);
    protected getParameterFormDescs(): import("tdp_core").IFormElementDesc[];
    get itemIDType(): import("visyn_core/idtype").IDType;
    private get dataSource();
    private get dataSubType();
    protected parameterChanged(name: string): Promise<void>;
    protected loadColumnDesc(): Promise<Readonly<import("tdp_core").IDatabaseViewDesc>>;
    protected createSelectionAdapter(): import("tdp_core").ISelectionAdapter;
    protected getColumnDescs(columns: IServerColumn[]): import("tdp_core").IAdditionalColumnDesc[];
    protected loadRows(): Promise<import("visyn_core/base").IRow[]>;
    private loadSelectionColumnData;
    static createExpressionDependentSampleTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): DependentSampleTable;
    static createCopyNumberDependentSampleTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): DependentSampleTable;
    static createMutationDependentSampleTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): DependentSampleTable;
}
//# sourceMappingURL=DependentSampleTable.d.ts.map