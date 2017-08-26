

import {ACommonList, IACommonListOptions} from 'tdp_gene/src/views/ACommonList';
import {ISelection, IViewContext} from 'tdp_core/src/views';
import {gene} from '../config';
import {categoricalCol, stringCol} from 'tdp_core/src/lineup';
import {IServerColumn} from 'tdp_core/src/rest';

export default class GeneList extends ACommonList {

  constructor(context:IViewContext, selection: ISelection, parent:HTMLElement, options: IACommonListOptions) {
    super(context, selection, parent, gene, options);
  }

  protected getColumnDescs(columns: IServerColumn[]) {
    return gene.columns(columns);
  }
}
