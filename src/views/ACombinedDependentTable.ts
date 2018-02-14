import {IViewContext, ISelection} from 'tdp_core/src/views';
import {getSelectedSpecies} from 'tdp_gene/src/common';
import {
  IDataTypeConfig,
  IDataSourceConfig,
  splitTypes
} from '../config';
import {ParameterFormIds, FORM_DATA_HIERARCHICAL_SUBTYPE} from '../forms';
import {ARankingView, multi} from 'tdp_core/src/lineup';
import {getTDPDesc, getTDPFilteredRows, getTDPScore, IParams, IServerColumn} from 'tdp_core/src/rest';
import {IAdditionalColumnDesc} from 'tdp_core/src/lineup/desc';
import {postProcessScore, subTypeDesc} from './utils';
import {IScoreRow} from 'tdp_core/src/extensions';
import {resolve} from 'phovea_core/src/idtype';
import {toFilter} from 'tdp_core/src/lineup';


abstract class ACombinedDependentTable extends ARankingView {

  protected dataSource: IDataSourceConfig;

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, protected readonly dataType: IDataTypeConfig[], options = {}) {
    super(context, selection, parent, Object.assign(options,{
      additionalScoreParameter: () => this.oppositeDataSource,
      itemName: () => this.oppositeDataSource.name,
      enableSidePanel: 'collapsed'
    }));

    this.dataType = dataType;
  }

  protected abstract get oppositeDataSource(): IDataSourceConfig;

  get itemIDType() {
    return resolve(this.oppositeDataSource.idType);
  }

  protected getParameterFormDescs() {
    return super.getParameterFormDescs().concat([
      Object.assign(
        {},
        FORM_DATA_HIERARCHICAL_SUBTYPE,
        {
          label: 'Data Subtype',
          attributes: {
            style: 'width:500px'
          }
        }
      )
    ]);
  }

  private get subTypes() {
    const value: { id: string, text: string }[] = this.getParameter(ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE);
    return value.map(({id, text}) => {
      const {dataType, dataSubType} = splitTypes(id);
      return {label: text, id, dataType, dataSubType};
    });
  }

  protected createSelectionAdapter() {
    return multi({
      createDescs: (_id: number, id: string) => this.getSelectionColumnDesc(_id, id),
      loadData: (_id: number, id: string, descs: IAdditionalColumnDesc[]) => this.loadSelectionColumnData(id, descs),
      getSelectedSubTypes: () => this.subTypes.map((d) => d.id)
    });
  }

  protected parameterChanged(name: string) {
    super.parameterChanged(name);
    if (name === 'filter') {
      this.reloadData();
    }
  }

  protected loadColumnDesc() {
    return getTDPDesc(this.dataSource.db, this.oppositeDataSource.base);
  }
  protected getColumnDescs(columns: IServerColumn[]) {
    return this.oppositeDataSource.columns((c) => columns.find((d) => d.column === c));
  }

  protected loadRows() {
    const filter = toFilter(this.getParameter('filter'));
    filter.species = getSelectedSpecies();
    return getTDPFilteredRows(this.dataSource.db, this.oppositeDataSource.tableName, {}, filter);
  }

  protected getSelectionColumnLabel(name: string): Promise<string>|string {
    return name;
  }

  protected async getSelectionColumnDesc(_id: number, name: string) {
    return Promise.resolve(this.getSelectionColumnLabel(name)).then((nlabel) => this.subTypes.map(({label, dataSubType, id}) => {
      const clabel = `${nlabel} (${label})`;
      const desc = subTypeDesc(dataSubType, _id, clabel, `col_${id}`);
      desc.selectedSubtype = id;
      return desc;
    }));
  }

  protected loadSelectionColumnData(name: string, descs: IAdditionalColumnDesc[]): Promise<IScoreRow<any>[]>[] {
    const filter = toFilter(this.getParameter('filter'));
    const param: IParams = {
      name,
      species: getSelectedSpecies()
    };
    const config = descs.map((option) => splitTypes(option.selectedSubtype));

    return config.map(({dataType, dataSubType}) => {
      return getTDPScore(this.dataSource.db, `${this.oppositeDataSource.base}_${this.dataSource.base}_single_score`, Object.assign({
        table: dataType.tableName,
        attribute: dataSubType.id
      }, param), filter).then(postProcessScore(dataSubType));
    });
  }
}

export default ACombinedDependentTable;
