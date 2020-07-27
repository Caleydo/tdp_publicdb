import {IViewContext, ISelection} from 'tdp_core';
import {
  gene,
  expression,
  copyNumber,
  mutation,
  IDataTypeConfig,
  IDataSourceConfig,
} from '../common/config';
import {ParameterFormIds, FORM_DATA_SOURCE, FORM_TISSUE_OR_CELLLINE_FILTER} from '../common/forms';
import {ACombinedDependentTable} from './ACombinedDependentTable';
import {ViewUtils} from './ViewUtils';

export class CombinedDependentSampleTable extends ACombinedDependentTable {
  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, dataType: IDataTypeConfig[]) {
    super(context, selection, parent, dataType);

    this.dataSource = gene;
  }

  protected get oppositeDataSource() {
    return <IDataSourceConfig>this.getParameterData(ParameterFormIds.DATA_SOURCE);
  }

  protected getParameterFormDescs() {
    const base = super.getParameterFormDescs();
    base.unshift(FORM_DATA_SOURCE);
    base.push(FORM_TISSUE_OR_CELLLINE_FILTER);
    return base;
  }

  protected parameterChanged(name: string) {
    if (name === FORM_DATA_SOURCE.id) {
      this.rebuild();
      return; // early abort since there is nothing worse than building from scratch
    }
    super.parameterChanged(name);
  }

  protected getSelectionColumnLabel(ensg: string) {
    return ViewUtils.loadFirstName(ensg);
  }

  static createCombinedDependentSampleTable(context: IViewContext, selection: ISelection, parent: HTMLElement) {
    return new CombinedDependentSampleTable(context, selection, parent, [copyNumber, expression, mutation]);
  }

}
