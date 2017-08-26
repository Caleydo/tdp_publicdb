/**
 * Created by Marc Streit on 26.07.2016.
 */

import {IScoreRow, ARankingView, single} from 'tdp_core/src/lineup';
import {getSelectedSpecies} from 'tdp_gene/src/common';
import {
  expression,
  copyNumber,
  mutation,
  IDataTypeConfig,
  IDataSourceConfig, IDataSubtypeConfig
} from '../config';
import {ParameterFormIds, FORM_DATA_SOURCE, FORM_TISSUE_OR_CELLLINE_FILTER} from '../forms';
import {toFilter} from 'tdp_gene/src/utils';
import {FormElementType, convertRow2MultiMap} from 'tdp_core/src/form';
import {ISelection, IViewContext} from 'tdp_core/src/views';
import {getTDPDesc, getTDPFilteredRows, getTDPScore, IServerColumn} from 'tdp_core/src/rest';
import {resolve} from 'phovea_core/src/idtype';
import {loadFirstName, postProcessScore, subTypeDesc} from './utils';

export default class DependentSampleTable extends ARankingView {

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, private readonly dataType: IDataTypeConfig, options = {}) {
    super(context, selection, parent, Object.assign({
      additionalScoreParameter: () => this.dataSource,
      itemName: () => this.dataSource.name,
    }, options));
  }

  protected getParameterFormDescs() {
    return super.getParameterFormDescs().concat([
      FORM_DATA_SOURCE,
      {
        type: FormElementType.SELECT,
        label: 'Data Subtype',
        id: ParameterFormIds.DATA_SUBTYPE,
        options: {
          optionsData: this.dataType.dataSubtypes.map((ds) => {
            return {name: ds.name, value: ds.id, data: ds};
          })
        },
        useSession: true
      },
      FORM_TISSUE_OR_CELLLINE_FILTER
    ]);
  }

  private get dataSource() {
    return <IDataSourceConfig>this.getParameter(ParameterFormIds.DATA_SOURCE);
  }

  private get dataSubType() {
    return <IDataSubtypeConfig>this.getParameter(ParameterFormIds.DATA_SUBTYPE);
  }

  protected parameterChanged(name: string) {
    super.parameterChanged(name);
    this.rebuild();
  }

  protected loadColumnDesc() {
    const dataSource = this.dataSource;
    return getTDPDesc(dataSource.db, dataSource.base);
  }

  protected createSelectionAdapter() {
    return single({
      createDesc: (_id: number, id: string) => loadFirstName(id).then((label) => subTypeDesc(this.dataSubType, _id, label)),
      loadData: (_id: number, id: string) => this.loadSelectionColumnData(id)
    });
  }

  protected getColumnDescs(columns: IServerColumn[]) {
    return this.dataSource.columns(columns);
  }

  protected loadRows() {
    const dataSource = this.getParameter(ParameterFormIds.DATA_SOURCE);
    const filter = {
      species: getSelectedSpecies()
    };
    toFilter(filter, convertRow2MultiMap(this.getParameter('filter')));
    return getTDPFilteredRows(dataSource.db, dataSource.base, {}, filter);
  }

  private loadSelectionColumnData(name: string): Promise<IScoreRow<any>[]> {
    const dataSource = this.dataSource;
    const subType = this.dataSubType;
    const param = {
      table: this.dataType.tableName,
      attribute: subType.id,
      name,
      species: getSelectedSpecies()
    };
    const filter = {};
    toFilter(filter, convertRow2MultiMap(this.getParameter('filter')));
    return getTDPScore(dataSource.db, `${dataSource.base}_gene_single_score`, param, filter).then(postProcessScore(subType));
  }
}

export function createExpressionTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?) {
  return new DependentSampleTable(context, selection, parent, expression, options);
}

export function createCopyNumberTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?) {
  return new DependentSampleTable(context, selection, parent, copyNumber, options);
}

export function createMutationTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?) {
  return new DependentSampleTable(context, selection, parent, mutation, options);
}
