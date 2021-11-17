/**
 * Created by Marc Streit on 26.07.2016.
 */

import {ARankingView, AdapterUtils, IARankingViewOptions} from 'tdp_core';
import {IScoreRow} from 'tdp_core';
import {SpeciesUtils} from 'tdp_gene';
import {
  expression,
  copyNumber,
  mutation,
  IDataTypeConfig,
  IDataSourceConfig, IDataSubtypeConfig
} from '../common/config';
import {ParameterFormIds, FORM_DATA_SOURCE, FORM_TISSUE_OR_CELLLINE_FILTER} from '../common/forms';
import {FormElementType} from 'tdp_core';
import {ISelection, IViewContext} from 'tdp_core';
import {RestBaseUtils, IServerColumn} from 'tdp_core';
import {IDTypeManager} from 'tdp_core';
import {ViewUtils} from './ViewUtils';
import {LineupUtils} from 'tdp_core';

export class DependentSampleTable extends ARankingView {

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, private readonly dataType: IDataTypeConfig, options: Partial<IARankingViewOptions> = {}) {
    super(context, selection, parent, Object.assign({
      additionalScoreParameter: () => this.dataSource,
      itemName: () => this.dataSource.name,
      enableAddingColumnGrouping: true
    }, Object.assign(options, { enableSidePanel: 'collapsed' })));
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
    return IDTypeManager.getInstance().resolveIdType(this.dataSource.idType);
  }

  private get dataSource() {
    return <IDataSourceConfig>this.getParameterData(ParameterFormIds.DATA_SOURCE);
  }

  private get dataSubType() {
    return <IDataSubtypeConfig>this.getParameterData(ParameterFormIds.DATA_SUBTYPE);
  }

  protected parameterChanged(name: string) {
    return this.rebuild();
  }

  protected loadColumnDesc() {
    const dataSource = this.dataSource;
    return RestBaseUtils.getTDPDesc(dataSource.db, dataSource.base);
  }

  protected createSelectionAdapter() {
    return AdapterUtils.single({
      createDesc: (_id: number, id: string) => ViewUtils.loadFirstName(id).then((label) => ViewUtils.subTypeDesc(this.dataSubType, _id, label)),
      loadData: (_id: number, id: string) => this.loadSelectionColumnData(id)
    });
  }

  protected getColumnDescs(columns: IServerColumn[]) {
    return this.dataSource.columns((c) => columns.find((d) => d.column === c));
  }

  protected loadRows() {
    const dataSource = this.dataSource;
    const filter = LineupUtils.toFilter(this.getParameter('filter'));
    filter.species = SpeciesUtils.getSelectedSpecies();
    return RestBaseUtils.getTDPFilteredRows(dataSource.db, dataSource.base, {}, filter);
  }

  private loadSelectionColumnData(name: string): Promise<IScoreRow<any>[]> {
    const dataSource = this.dataSource;
    const subType = this.dataSubType;
    const param = {
      table: this.dataType.tableName,
      attribute: subType.id,
      name,
      species: SpeciesUtils.getSelectedSpecies()
    };
    const filter = LineupUtils.toFilter(this.getParameter('filter'));
    return RestBaseUtils.getTDPScore(dataSource.db, `${dataSource.base}_gene_single_score`, param, filter).then(ViewUtils.postProcessScore(subType));
  }

  static createExpressionDependentSampleTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?) {
    return new DependentSampleTable(context, selection, parent, expression, options);
  }

  static createCopyNumberDependentSampleTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?) {
    return new DependentSampleTable(context, selection, parent, copyNumber, options);
  }

  static createMutationDependentSampleTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?) {
    return new DependentSampleTable(context, selection, parent, mutation, options);
  }

}
