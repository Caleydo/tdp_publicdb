import {IViewContext, ISelection} from 'tdp_core/src/views';
import {getSelectedSpecies} from 'tdp_gene/src/common';
import {
  gene,
  IDataTypeConfig,
  IDataSourceConfig,
  splitTypes
} from '../config';
import {ParameterFormIds, FORM_DATA_HIERARCHICAL_SUBTYPE} from '../forms';
import {toFilter} from 'tdp_gene/src/utils';
import {convertLog2ToLinear} from 'tdp_gene/src/utils';
import {ISelect2Option, IFormSelect2} from 'tdp_core/src/form';
import {ARankingView, multi} from 'tdp_core/src/lineup';
import {getTDPDesc, getTDPFilteredRows, getTDPScore} from 'tdp_core/src/rest';


abstract class ACombinedDependentTable extends ARankingView {

  protected dataSource: IDataSourceConfig;
  protected oppositeDataSource: IDataSourceConfig;

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, protected readonly dataType: IDataTypeConfig[]) {
    super(context, selection, parent, {
      itemName: gene.name
    });

    this.dataType = dataType;
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

  protected createSelectionAdapter() {
    return multi({
      createDescs: (_id: number, id: string, subTypes: string[]) => this.getSelectionColumnDesc(_id, id, subTypes),
      loadData: (_id: number, id: string, descs: IAdditionalColumnDesc[]) => undefined,
      getSelectedSubTypes: () => this.getParameter(ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE).map((d) => d.id)
    })
  }

  protected initImpl() {
    super.initImpl();
    this.update().then(() => this.handleSelectionColumns(this.selection));
  }

  protected parameterChanged(name: string) {
    if (name === 'filter') {
      this.reloadData();
    }
    super.parameterChanged(name);
  }

  protected loadColumnDesc() {
    return getTDPDesc(this.dataSource.db, this.oppositeDataSource.base);
  }

  protected loadRows() {
    const param = {
      filter_species: getSelectedSpecies()
    };
    toFilter(param, convertRow2MultiMap(this.getParameter('filter')));
    return getTDPFilteredRows(this.dataSource.db, this.oppositeDataSource.tableName, param, {});
  }

  protected async getSelectionColumnDesc(_id: number, id: string, subTypes: string[]) {
    const selectedItem = await this.getSelectionColumnLabel(id);
    const subTypes = this.getParameter(ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE);

    return selectedSubTypes.map((selectedSubType) => {
        const label = `${selectedItem} (${selectedSubType.text})`;
        const {dataSubType} = splitTypes(selectedSubType.id);

        switch(dataSubType.type) {
          case 'boolean':
            return stringCol(this.getSelectionColumnId(id), label, true, 50, id, selectedSubType.id);
          case 'string':
            return stringCol(this.getSelectionColumnId(id), label, true, 50, id, selectedSubType.id);
          case 'cat':
            return categoricalCol(this.getSelectionColumnId(id), dataSubType.categories, label, true, 50, id, selectedSubType.id);
          default:
            return numberCol2(this.getSelectionColumnId(id), dataSubType.domain[0], dataSubType.domain[1], label, true, 50, id, selectedSubType.id);
        }
      });
  }

  protected loadSelectionColumnData(id: number, desc: any[]): Promise<IScoreRow<any>[]>[] {
    // TODO When playing the provenance graph, the RawDataTable is loaded before the GeneList has finished loading, i.e. that the local idType cache is not build yet and it will send an unmap request to the server
    const namePromise = resolveId(this.selection.idtype, id, this.idType);
    const url = `/targid/db/${this.dataSource.db}/${this.oppositeDataSource.base}_${this.dataSource.base}_single_score/filter`;
    const config = desc.map((option) => splitTypes(option.selectedSubtype));

    const filter = convertRow2MultiMap(this.getParameter('filter'));

    return <any>namePromise.then((name: string) => {
      return config.map((entry) => {
        const param = {
          table: entry.dataType.tableName,
          attribute: entry.dataSubType.id,
          name,
          species: getSelectedSpecies()
        };

        toFilter(param, filter);
        return getTDPScore(url, param);
      });
    }).then((rows) => {
      const {dataSubType} = splitTypes(colDesc.selectedSubtype);
      if (dataSubType.useForAggregation.indexOf('log2') !== -1) {
        rows = convertLog2ToLinear(rows, 'score');
      }
    });
  }

  protected loadDynamicColumnOptions(): ISelect2Option[] {
    return ;
  }
}

export default ACombinedDependentTable;
