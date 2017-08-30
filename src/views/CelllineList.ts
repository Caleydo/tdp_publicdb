

import {ACommonList, IACommonListOptions} from 'tdp_gene/src/views/ACommonList';
import {ISelection, IViewContext} from 'tdp_core/src/views';
import {cellline} from '../config';
import {IServerColumn} from 'tdp_core/src/rest';

export default class CelllineList extends ACommonList {

  constructor(context:IViewContext, selection: ISelection, parent:HTMLElement, options: IACommonListOptions) {
    super(context, selection, parent, cellline, options);
  }

  protected getColumnDescs(columns: IServerColumn[]) {
    return cellline.columns(columns);
  }
}
