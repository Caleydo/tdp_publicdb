import { ACommonList, IACommonListOptions } from 'tdp_gene';
import { ISelection, IViewContext } from 'tdp_core';
import { IServerColumn } from 'tdp_core';
export declare class TissueList extends ACommonList {
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: IACommonListOptions);
    protected getColumnDescs(columns: IServerColumn[]): any[];
}
