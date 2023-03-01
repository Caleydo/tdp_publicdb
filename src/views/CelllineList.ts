import { IServerColumn } from 'visyn_core';
import { ISelection, IViewContext } from 'tdp_core';
import { cellline } from '../common/config';
import { ACommonList, IACommonListOptions } from './ACommonList';
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
