import {IViewContext, ISelection} from 'tdp_core/src/views';
import {
  gene,
  expression,
  copyNumber,
  mutation,
  IDataTypeConfig,
  IDataSourceConfig,
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
    return loadFirstName(ensg);
  }
}

export function createCombinedDependentSampleTable(context: IViewContext, selection: ISelection, parent: HTMLElement) {
  return new CombinedDependentSampleTable(context, selection, parent, [copyNumber, expression, mutation]);
}
