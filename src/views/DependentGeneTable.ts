/**
 * Created by Marc Streit on 28.07.2016.
 */

import {IScoreRow, ARankingView, single} from 'tdp_core/src/lineup';
import {getSelectedSpecies} from 'tdp_gene/src/common';
import {
  gene,
  expression,
  copyNumber,
  mutation,
  IDataTypeConfig,
  chooseDataSource,
  IDataSourceConfig, IDataSubtypeConfig
} from '../config';
import {ParameterFormIds, FORM_GENE_FILTER} from '../forms';
import {toFilter} from 'tdp_gene/src/utils';
import {FormElementType, convertRow2MultiMap} from 'tdp_core/src/form';
import {ISelection, IViewContext} from 'tdp_core/src/views';
import {getTDPDesc, getTDPFilteredRows, getTDPScore, IServerColumn} from 'tdp_core/src/rest';
import {postProcessScore, subTypeDesc} from './utils';

export default class DependentGeneTable extends ARankingView {
  private readonly dataSource: IDataSourceConfig;

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, private readonly dataType: IDataTypeConfig, options = {}) {
    super(context, selection, parent, Object.assign({
      additionalScoreParameter: gene,
      itemName: gene.name,
      itemIDType: gene.idType
    }, options));

    this.dataSource = chooseDataSource(context.desc);
  }

  protected getParameterFormDescs() {
    return super.getParameterFormDescs().concat([
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
      FORM_GENE_FILTER
    ]);
  }

  protected parameterChanged(name: string) {
    super.parameterChanged(name);
    this.rebuild();
  }

  protected loadColumnDesc() {
    return getTDPDesc(gene.db, gene.base);
  }

  protected createSelectionAdapter() {
    return single({
      createDesc: (_id: number, id: string) => subTypeDesc(this.dataSubType, _id, id),
      loadData: (_id: number, id: string) => this.loadSelectionColumnData(id)
    });
  }

  protected getColumnDescs(columns: IServerColumn[]) {
    return gene.columns(columns);
  }

  protected loadRows() {
    const filter = {
      species: getSelectedSpecies()
    };
    toFilter(filter, convertRow2MultiMap(this.getParameter('filter')));
    return getTDPFilteredRows(gene.db, gene.base, {}, filter);
  }

  private get dataSubType() {
    return <IDataSubtypeConfig>this.getParameterData(ParameterFormIds.DATA_SUBTYPE);
  }

  private loadSelectionColumnData(name: string): Promise<IScoreRow<any>[]> {
    const subType = this.dataSubType;
    const param = {
      table: this.dataType.tableName,
      attribute: subType.id,
      name,
      species: getSelectedSpecies()
    };
    const filter = {};
    toFilter(filter, convertRow2MultiMap(this.getParameter('filter')));
    return getTDPScore(gene.db, `gene_${this.dataSource.base}_single_score`, param, filter).then(postProcessScore(subType));
  }
}

export function createExpressionTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?) {
  return new DependentGeneTable(context, selection, parent, expression, options);
}

export function createCopyNumberTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?) {
  return new DependentGeneTable(context, selection, parent, copyNumber, options);
}

export function createMutationTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?) {
  return new DependentGeneTable(context, selection, parent, mutation, options);
}
