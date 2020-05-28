import { ACommonList, IACommonListOptions } from 'tdp_gene/src/views/ACommonList';
import { ISelection, IViewContext } from 'tdp_core/src/views';
import { IServerColumn } from 'tdp_core/src/rest';
export declare class CelllineList extends ACommonList {
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: IACommonListOptions);
    protected getColumnDescs(columns: IServerColumn[]): import("tdp_core/src/lineup").IAdditionalColumnDesc[];
}
