import {IViewContext, ISelection} from 'tdp_core';
import {
  gene,
  expression,
  copyNumber,
  mutation,
  IDataTypeConfig,
  chooseDataSource,
} from '../common/config';
import {FORM_GENE_FILTER} from '../common/forms';
import {ACombinedDependentTable} from './ACombinedDependentTable';

export class CombinedDependentGeneTable extends ACombinedDependentTable {
  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, dataType: IDataTypeConfig[]) {
    super(context, selection, parent, dataType);

    this.dataSource = chooseDataSource(context.desc);
  }

  protected get oppositeDataSource() {
    return gene;
  }

  protected getParameterFormDescs() {
    return super.getParameterFormDescs().concat([FORM_GENE_FILTER]);
  }
  static createCombinedDependentGeneTable(context: IViewContext, selection: ISelection, parent: HTMLElement) {
    return new CombinedDependentGeneTable(context, selection, parent, [copyNumber, expression, mutation]);
  }
}
