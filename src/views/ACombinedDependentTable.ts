import { IServerColumn } from 'visyn_core/base';
import { IDTypeManager } from 'visyn_core/idtype';
import { IViewContext, ISelection, ARankingView, RestBaseUtils, IParams, IAdditionalColumnDesc, IScoreRow, LineupUtils, AdapterUtils } from 'tdp_core';
import { SpeciesUtils } from '../common';
import { ParameterFormIds, FORM_DATA_HIERARCHICAL_SUBTYPE } from '../common/forms';
import { ViewUtils } from './ViewUtils';
import { IDataTypeConfig, IDataSourceConfig, splitTypes } from '../common/config';

export abstract class ACombinedDependentTable extends ARankingView {
  protected dataSource: IDataSourceConfig;

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, protected readonly dataType: IDataTypeConfig[], options = {}) {
    super(
      context,
      selection,
      parent,
      Object.assign(options, {
        additionalScoreParameter: () => this.oppositeDataSource,
        itemName: () => this.oppositeDataSource.name,
        enableSidePanel: <const>'collapsed',
        enableAddingColumnGrouping: true,
        panelAddColumnBtnOptions: {
          btnClass: 'btn-primary',
        },
        ...ViewUtils.rankingOptionsFromEnv(),
      }),
    );

    this.dataType = dataType;
  }

  protected abstract get oppositeDataSource(): IDataSourceConfig;

  get itemIDType() {
    return IDTypeManager.getInstance().resolveIdType(this.oppositeDataSource.idType);
  }

  protected getParameterFormDescs() {
    return super.getParameterFormDescs().concat([
      {
        ...FORM_DATA_HIERARCHICAL_SUBTYPE,
        label: 'Data Subtype',
        attributes: {
          style: 'width:500px',
        },
      },
    ]);
  }

  private get subTypes() {
    const value: { id: string; text: string }[] = this.getParameter(ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE);
    return value.map(({ id, text }) => {
      const { dataType, dataSubType } = splitTypes(id);
      return { label: text, id, dataType, dataSubType };
    });
  }

  protected createSelectionAdapter() {
    return AdapterUtils.multi({
      createDescs: async (id: string) => {
        const ids = await IDTypeManager.getInstance().mapNameToFirstName(this.selection.idtype, [id], this.dataSource.idType);
        return this.getSelectionColumnDesc(id, ids[0]);
      },
      loadData: (id: string, descs: IAdditionalColumnDesc[]): Promise<IScoreRow<any>[]>[] => {
        return descs.map(async (desc) => {
          // map descs here to return Promise array
          const ids = await IDTypeManager.getInstance().mapNameToFirstName(this.selection.idtype, [id], this.dataSource.idType);
          return this.loadSelectionColumnData(ids[0], [desc])[0]; // send single desc and pick immediately
        });
      },
      getSelectedSubTypes: () => this.subTypes.map((d) => d.id),
    });
  }

  protected parameterChanged(name: string): Promise<void> {
    super.parameterChanged(name);
    if (name === 'filter') {
      return this.reloadData();
    }
    return Promise.resolve();
  }

  protected loadColumnDesc() {
    return RestBaseUtils.getTDPDesc(this.dataSource.db, this.oppositeDataSource.base);
  }

  protected getColumnDescs(columns: IServerColumn[]) {
    return this.oppositeDataSource.columns((c) => columns.find((d) => d.column === c));
  }

  protected loadRows() {
    const filter = LineupUtils.toFilter(this.getParameter('filter'));
    filter.species = SpeciesUtils.getSelectedSpecies();
    return RestBaseUtils.getTDPFilteredRows(this.dataSource.db, this.oppositeDataSource.tableName, {}, filter);
  }

  protected getSelectionColumnLabel(name: string): Promise<string> | string {
    return name;
  }

  protected async getSelectionColumnDesc(_id: string, name: string) {
    return Promise.resolve(this.getSelectionColumnLabel(name)).then((nlabel) =>
      this.subTypes.map(({ label, dataSubType, id }) => {
        const clabel = `${nlabel} (${label})`;
        const desc = ViewUtils.subTypeDesc(dataSubType, _id, clabel, `col_${id}`);
        desc.selectedSubtype = id;
        return desc;
      }),
    );
  }

  protected loadSelectionColumnData(name: string, descs: IAdditionalColumnDesc[]): Promise<IScoreRow<any>[]>[] {
    const filter = LineupUtils.toFilter(this.getParameter('filter'));
    const param: IParams = {
      name,
      species: SpeciesUtils.getSelectedSpecies(),
    };
    const config = descs.map((option) => splitTypes(option.selectedSubtype));

    return config.map(({ dataType, dataSubType }) => {
      return RestBaseUtils.getTDPScore(
        this.dataSource.db,
        `${this.oppositeDataSource.base}_${this.dataSource.base}_single_score`,
        {
          table: dataType.tableName,
          attribute: dataSubType.id,
          ...param,
        },
        filter,
      ).then(ViewUtils.postProcessScore(dataSubType));
    });
  }
}
