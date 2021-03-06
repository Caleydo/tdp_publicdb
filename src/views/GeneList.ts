

import {ACommonList, IACommonListOptions} from 'tdp_gene';
import {ISelection, IViewContext} from 'tdp_core';
import {gene} from '../common/config';
import {IServerColumn} from 'tdp_core';

export class GeneList extends ACommonList {

  constructor(context:IViewContext, selection: ISelection, parent:HTMLElement, options: IACommonListOptions) {
    super(context, selection, parent, gene, Object.assign({
      enableAddingColumnGrouping: true
    }, options));
  }

  protected getColumnDescs(columns: IServerColumn[]) {
    return gene.columns((c) => columns.find((d) => d.column === c));
  }
}
