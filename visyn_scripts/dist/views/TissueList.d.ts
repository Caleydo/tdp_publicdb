import { ACommonList, IACommonListOptions } from 'tdp_gene';
import { ISelection, IViewContext, IServerColumn } from 'tdp_core';
export declare class TissueList extends ACommonList {
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: IACommonListOptions);
    protected getColumnDescs(columns: IServerColumn[]): import("tdp_core").IAdditionalColumnDesc[];
}
//# sourceMappingURL=TissueList.d.ts.map