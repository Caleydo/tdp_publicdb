

import {ACommonList, IACommonListOptions} from 'tdp_gene';
import {ISelection, IViewContext} from 'tdp_core';
import {tissue} from '../common/config';
import {IServerColumn} from 'tdp_core';

export class TissueList extends ACommonList {

  constructor(context:IViewContext, selection: ISelection, parent:HTMLElement, options: IACommonListOptions) {
    super(context, selection, parent, tissue, Object.assign({
      enableAddingColumnGrouping: true
    }, options));
  }

  protected getColumnDescs(columns: IServerColumn[]) {
    return tissue.columns((c) => columns.find((d) => d.column === c));
  }
}
