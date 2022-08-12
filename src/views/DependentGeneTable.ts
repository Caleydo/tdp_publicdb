/**
 * Created by Marc Streit on 28.07.2016.
 */

import {
  ARankingView,
  AdapterUtils,
  IARankingViewOptions,
  IScoreRow,
  FormElementType,
  ISelection,
  IViewContext,
  RestBaseUtils,
  IServerColumn,
  LineupUtils,
  IDTypeManager,
} from 'tdp_core';
import { ParameterFormIds, FORM_GENE_FILTER } from '../common/forms';
import { ViewUtils } from './ViewUtils';
import { gene, expression, copyNumber, mutation, IDataTypeConfig, chooseDataSource, IDataSourceConfig, IDataSubtypeConfig } from '../common/config';
import { Species, SpeciesUtils } from '../common';

export class DependentGeneTable extends ARankingView {
  private readonly dataSource: IDataSourceConfig;

  constructor(
    context: IViewContext,
    selection: ISelection,
    parent: HTMLElement,
    private readonly dataType: IDataTypeConfig,
    options: Partial<IARankingViewOptions> = {},
  ) {
    super(context, selection, parent, {
      additionalScoreParameter: gene,
      itemName: gene.name,
      itemIDType: gene.idType,
      subType: {
        key: Species.SPECIES_SESSION_KEY,
        value: SpeciesUtils.getSelectedSpecies(),
      },
      enableAddingColumnGrouping: true,
      panelAddColumnBtnOptions: {
        btnClass: 'btn-primary',
      },
      enableSidePanel: 'collapsed',
      ...ViewUtils.rankingOptionsFromEnv(),
      ...options,
    });

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
            return { name: ds.name, value: ds.id, data: ds };
          }),
        },
        useSession: true,
      },
      FORM_GENE_FILTER,
    ]);
  }

  protected parameterChanged(name: string) {
    return this.rebuild();
  }

  protected loadColumnDesc() {
    return RestBaseUtils.getTDPDesc(gene.db, gene.base);
  }

  protected createSelectionAdapter() {
    return AdapterUtils.single({
      createDesc: async (id: string) => {
        const ids = await IDTypeManager.getInstance().mapNameToFirstName(this.selection.idtype, [id], this.dataSource.idType);
        return ViewUtils.subTypeDesc(this.dataSubType, id, ids[0]);
      },
      loadData: async (id: string) => {
        const ids = await IDTypeManager.getInstance().mapNameToFirstName(this.selection.idtype, [id], this.dataSource.idType);
        return this.loadSelectionColumnData(ids[0]);
      },
    });
  }

  protected getColumnDescs(columns: IServerColumn[]) {
    return gene.columns((c) => columns.find((d) => d.column === c));
  }

  protected loadRows() {
    const filter = LineupUtils.toFilter(this.getParameter('filter'));
    filter.species = SpeciesUtils.getSelectedSpecies();
    return RestBaseUtils.getTDPFilteredRows(gene.db, gene.base, {}, filter);
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
      species: SpeciesUtils.getSelectedSpecies(),
    };
    const filter = LineupUtils.toFilter(this.getParameter('filter'));
    return RestBaseUtils.getTDPScore(gene.db, `gene_${this.dataSource.base}_single_score`, param, filter).then(ViewUtils.postProcessScore(subType));
  }

  static createExpressionDependentGeneTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?) {
    return new DependentGeneTable(context, selection, parent, expression, options);
  }

  static createCopyNumberDependentGeneTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?) {
    return new DependentGeneTable(context, selection, parent, copyNumber, options);
  }

  static createMutationDependentGeneTable(context: IViewContext, selection: ISelection, parent: HTMLElement, options?) {
    return new DependentGeneTable(context, selection, parent, mutation, options);
  }
}
