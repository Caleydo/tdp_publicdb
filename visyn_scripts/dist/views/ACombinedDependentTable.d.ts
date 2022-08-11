import { IViewContext, ISelection, ARankingView, IServerColumn, IAdditionalColumnDesc, IScoreRow } from 'tdp_core';
import { IDataTypeConfig, IDataSourceConfig } from '../common/config';
export declare abstract class ACombinedDependentTable extends ARankingView {
    protected readonly dataType: IDataTypeConfig[];
    protected dataSource: IDataSourceConfig;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, dataType: IDataTypeConfig[], options?: {});
    protected abstract get oppositeDataSource(): IDataSourceConfig;
    get itemIDType(): import("tdp_core").IDType;
    protected getParameterFormDescs(): import("tdp_core").IFormElementDesc[];
    private get subTypes();
    protected createSelectionAdapter(): import("tdp_core").ISelectionAdapter;
    protected parameterChanged(name: string): Promise<void>;
    protected loadColumnDesc(): Promise<Readonly<import("tdp_core").IDatabaseViewDesc>>;
    protected getColumnDescs(columns: IServerColumn[]): IAdditionalColumnDesc[];
    protected loadRows(): Promise<import("tdp_core").IRow[]>;
    protected getSelectionColumnLabel(name: string): Promise<string> | string;
    protected getSelectionColumnDesc(_id: string, name: string): Promise<IAdditionalColumnDesc[]>;
    protected loadSelectionColumnData(name: string, descs: IAdditionalColumnDesc[]): Promise<IScoreRow<any>[]>[];
}
//# sourceMappingURL=ACombinedDependentTable.d.ts.map