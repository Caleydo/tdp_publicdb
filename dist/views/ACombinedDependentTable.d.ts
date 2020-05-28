import { IViewContext, ISelection } from 'tdp_core/src/views';
import { IDataTypeConfig, IDataSourceConfig } from '../config';
import { ARankingView } from 'tdp_core/src/lineup';
import { IServerColumn } from 'tdp_core/src/rest';
import { IAdditionalColumnDesc } from 'tdp_core/src/lineup/desc';
import { IScoreRow } from 'tdp_core/src/extensions';
export declare abstract class ACombinedDependentTable extends ARankingView {
    protected readonly dataType: IDataTypeConfig[];
    protected dataSource: IDataSourceConfig;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, dataType: IDataTypeConfig[], options?: {});
    protected abstract get oppositeDataSource(): IDataSourceConfig;
    get itemIDType(): import("phovea_core/src/idtype").IDType;
    protected getParameterFormDescs(): import("tdp_core/src/form").IFormElementDesc[];
    private get subTypes();
    protected createSelectionAdapter(): import("tdp_core/src/lineup").ISelectionAdapter;
    protected parameterChanged(name: string): void;
    protected loadColumnDesc(): Promise<Readonly<import("tdp_core/src/rest").IDatabaseViewDesc>>;
    protected getColumnDescs(columns: IServerColumn[]): IAdditionalColumnDesc[];
    protected loadRows(): Promise<import("tdp_core/src/rest").IRow[]>;
    protected getSelectionColumnLabel(name: string): Promise<string> | string;
    protected getSelectionColumnDesc(_id: number, name: string): Promise<IAdditionalColumnDesc[]>;
    protected loadSelectionColumnData(name: string, descs: IAdditionalColumnDesc[]): Promise<IScoreRow<any>[]>[];
}
