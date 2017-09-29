

import {ACommonList, IACommonListOptions} from 'tdp_gene/src/views/ACommonList';
import {ISelection, IViewContext} from 'tdp_core/src/views';
import {tissue} from '../config';
import {IServerColumn} from 'tdp_core/src/rest';

export default class TissueList extends ACommonList {

  constructor(context:IViewContext, selection: ISelection, parent:HTMLElement, options: IACommonListOptions) {
    super(context, selection, parent, tissue, options);
  }

  protected getColumnDescs(columns: IServerColumn[]) {
    return tissue.columns((c) => columns.find((d) => d.column === c));
  }
}
