import { IViewContext, ISelection } from 'tdp_core';
import { IDataTypeConfig, IDataSourceConfig } from '../common/config';
import { ARankingView } from 'tdp_core';
import { IServerColumn } from 'tdp_core';
import { IAdditionalColumnDesc } from 'tdp_core';
import { IScoreRow } from 'tdp_core';
export declare abstract class ACombinedDependentTable extends ARankingView {
    protected readonly dataType: IDataTypeConfig[];
    protected dataSource: IDataSourceConfig;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, dataType: IDataTypeConfig[], options?: {});
    protected abstract get oppositeDataSource(): IDataSourceConfig;
    get itemIDType(): import("phovea_core").IDType;
    protected getParameterFormDescs(): import("tdp_core/dist/form/interfaces").IFormElementDesc[];
    private get subTypes();
    protected createSelectionAdapter(): import("tdp_core/dist/lineup/selection/ISelectionAdapter").ISelectionAdapter;
    protected parameterChanged(name: string): void;
    protected loadColumnDesc(): Promise<Readonly<import("tdp_core/dist/base/rest").IDatabaseViewDesc>>;
    protected getColumnDescs(columns: IServerColumn[]): IAdditionalColumnDesc[];
    protected loadRows(): Promise<import("tdp_core/dist/base/rest").IRow[]>;
    protected getSelectionColumnLabel(name: string): Promise<string> | string;
    protected getSelectionColumnDesc(_id: number, name: string): Promise<IAdditionalColumnDesc[]>;
    protected loadSelectionColumnData(name: string, descs: IAdditionalColumnDesc[]): Promise<IScoreRow<any>[]>[];
}
