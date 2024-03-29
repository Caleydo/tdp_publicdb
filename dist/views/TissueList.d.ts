import { IServerColumn } from 'visyn_core/base';
import { ISelection, IViewContext } from 'tdp_core';
import { ACommonList, IACommonListOptions } from './ACommonList';
export declare class TissueList extends ACommonList {
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: IACommonListOptions);
    protected getColumnDescs(columns: IServerColumn[]): import("tdp_core").IAdditionalColumnDesc[];
}
//# sourceMappingURL=TissueList.d.ts.map