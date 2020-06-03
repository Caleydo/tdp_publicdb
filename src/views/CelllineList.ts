

import {ACommonList, IACommonListOptions} from 'tdp_gene';
import {ISelection, IViewContext} from 'tdp_core';
import {cellline} from '../common/config';
import {IServerColumn} from 'tdp_core';

export class CelllineList extends ACommonList {

  constructor(context:IViewContext, selection: ISelection, parent:HTMLElement, options: IACommonListOptions) {
    super(context, selection, parent, cellline, Object.assign({
      enableAddingColumnGrouping: true
    }, options));
  }

  protected getColumnDescs(columns: IServerColumn[]) {
    return cellline.columns((c) => columns.find((d) => d.column === c));
  }
}
