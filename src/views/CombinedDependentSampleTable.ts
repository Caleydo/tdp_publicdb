import {IViewContext, ISelection} from 'tdp_core/src/views';
import {
  gene,
  expression,
  copyNumber,
  mutation,
  IDataTypeConfig,
} from '../config';
import {ParameterFormIds, FORM_DATA_SOURCE, FORM_TISSUE_OR_CELLLINE_FILTER} from '../forms';
import ACombinedTable from './ACombinedDependentTable';
import {loadFirstName} from './utils';

export class CombinedDependentSampleTable extends ACombinedTable {
  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, dataType: IDataTypeConfig[]) {
    super(context, selection, parent, dataType);

    this.dataSource = gene;
  }

  protected get oppositeDataSource() {
    return this.getParameter(ParameterFormIds.DATA_SOURCE);
  }

  protected getParameterFormDescs() {
    const base = super.getParameterFormDescs();
    base.unshift(FORM_DATA_SOURCE);
    base.push(FORM_TISSUE_OR_CELLLINE_FILTER);
    return base;
  }

  protected getSelectionColumnLabel(ensg: string) {
    return loadFirstName(ensg);
  }
}

export function create(context: IViewContext, selection: ISelection, parent: HTMLElement) {
  return new CombinedDependentSampleTable(context, selection, parent, [copyNumber, expression, mutation]);
}
