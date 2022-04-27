import { ACommonList, IACommonListOptions } from 'tdp_gene';
import { ISelection, IViewContext, IServerColumn } from 'tdp_core';
import { cellline } from '../common/config';
import { ViewUtils } from './ViewUtils';

export class CelllineList extends ACommonList {
  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: IACommonListOptions) {
    super(context, selection, parent, cellline, {
      enableAddingColumnGrouping: true,
      ...ViewUtils.rankingOptionsFromEnv(),
      ...options,
    });
  }

  protected getColumnDescs(columns: IServerColumn[]) {
    return cellline.columns((c) => columns.find((d) => d.column === c));
  }
}
