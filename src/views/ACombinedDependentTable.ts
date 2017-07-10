import * as ajax from 'phovea_core/src/ajax';
import {IViewContext, ISelection} from 'ordino/src/View';
import {
  stringCol, numberCol2, categoricalCol,
  ALineUpView2, IScoreRow
} from 'ordino/src/LineUpView';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {
  gene,
  IDataTypeConfig,
  IDataSourceConfig,
  splitTypes
} from '../config';
import {ParameterFormIds} from '../forms';
import {convertRow2MultiMap} from 'ordino/src/form/internal/FormMap';
import {toFilter} from 'targid_common/src/utils';
import {FormBuilder} from 'ordino/src/FormBuilder';
import {convertLog2ToLinear} from 'targid_common/src/utils';


abstract class ACombinedTable extends ALineUpView2 {

  protected dataType: IDataTypeConfig[];

  /**
   * Parameter UI form
   */
  protected paramForm: FormBuilder;

  protected dataSource: IDataSourceConfig;

  protected oppositeDataSource: IDataSourceConfig;

  constructor(context: IViewContext, selection: ISelection, parent: Element, dataType: IDataTypeConfig[], options?) {
    super(context, selection, parent, options);

    this.dataType = dataType;
  }

  getParameter(name: string): any {
    return this.paramForm.getElementById(name).value;
  }

  setParameter(name: string, value: any) {
    this.paramForm.getElementById(name).value = value;

    if(name === 'filter') {
      this.clear();
    }
    super.setParameter(name, value);
    return this.update();
  }

  protected loadColumnDesc() {
    return ajax.getAPIJSON(`/targid/db/${this.oppositeDataSource.db}/${this.oppositeDataSource.base}/desc`);
  }

  protected loadRows() {
    const url = `/targid/db/${this.dataSource.db}/${this.oppositeDataSource.tableName}/filter`;
    const param = {
      filter_species: getSelectedSpecies()
    };
    toFilter(param, convertRow2MultiMap(this.getParameter('filter')));
    return ajax.getAPIJSON(url, param);
  }

  protected async getSelectionColumnDesc(id: number) {
    const selectedItem = await this.getSelectionColumnLabel(id);
    const selectedSubTypes = this.getParameter(ParameterFormIds.DATA_SUBTYPE);

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
    const namePromise = this.resolveId(this.selection.idtype, id, this.idType);
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
        return <Promise<IScoreRow<any>>>ajax.getAPIJSON(url, param);
      });
    });
  }

  protected mapSelectionRows(rows: IScoreRow<any>[], colDesc: any) {
    const {dataSubType} = splitTypes(colDesc.selectedSubtype);
    if (dataSubType.useForAggregation.indexOf('log2') !== -1) {
      rows = convertLog2ToLinear(rows, 'score');
    }

    return rows;
  }

  getItemName(count: number) {
    return (count === 1) ? gene.name.toLowerCase() : gene.name.toLowerCase() + 's';
  }
}

export default ACombinedTable;
