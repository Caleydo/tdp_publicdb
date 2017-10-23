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
import {FormElementType} from 'tdp_core/src/form';
import {ISelection, IViewContext} from 'tdp_core/src/views';
import {getTDPDesc, getTDPFilteredRows, getTDPScore, IServerColumn} from 'tdp_core/src/rest';
import {resolve} from 'phovea_core/src/idtype';
import {loadFirstName, postProcessScore, subTypeDesc} from './utils';
import {toFilter} from 'tdp_core/src/lineup';

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

  get itemIDType() {
    return resolve(this.dataSource.idType);
  }

  private get dataSource() {
    return <IDataSourceConfig>this.getParameterData(ParameterFormIds.DATA_SOURCE);
  }

  private get dataSubType() {
    return <IDataSubtypeConfig>this.getParameterData(ParameterFormIds.DATA_SUBTYPE);
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
    return this.dataSource.columns((c) => columns.find((d) => d.column === c));
  }

  protected loadRows() {
    const dataSource = this.dataSource;
    const filter = toFilter(this.getParameter('filter'));
    filter.species = getSelectedSpecies();
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
    const filter = toFilter(this.getParameter('filter'));
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
