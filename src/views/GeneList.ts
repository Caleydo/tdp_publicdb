import { ISelection, IViewContext, IServerColumn } from 'tdp_core';
import { gene } from '../common/config';
import { ACommonList, IACommonListOptions } from './ACommonList';
import { ViewUtils } from './ViewUtils';

export class GeneList extends ACommonList {
  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: IACommonListOptions) {
    super(context, selection, parent, gene, {
      enableAddingColumnGrouping: true,
      ...ViewUtils.rankingOptionsFromEnv(),
      ...options,
    });
  }

  protected getColumnDescs(columns: IServerColumn[]) {
    return gene.columns((c) => columns.find((d) => d.column === c));
  }
}
