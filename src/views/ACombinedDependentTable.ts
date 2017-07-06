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
  IDataSourceConfig
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

  constructor(context: IViewContext, selection: ISelection, parent: Element, dataType: IDataTypeConfig|IDataTypeConfig[], options?) {
    super(context, selection, parent, options);

    this.dataType = Array.isArray(dataType)? dataType : [dataType];
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

  protected mapRows(rows: any[]) {
    rows = super.mapRows(rows);
    return rows;
  }

  protected async getSelectionColumnDesc(id: number) {
    const selectedItem = await this.getSelectionColumnLabel(id);
    const selectedSubTypes = this.getParameter(ParameterFormIds.DATA_SUBTYPE);

    return selectedSubTypes.map((selectedSubType) => {
        const label = `${selectedItem} (${selectedSubType.text})`;
        const data = selectedSubType.data;

        // TODO: currently columns of the same gene with different subTypes have the same ID --> unique IDs?
        if (data.type === 'boolean') {
          return stringCol(this.getSelectionColumnId(id), label, true, 50, id, selectedSubType);
        } else if (data.type === 'string') {
          return stringCol(this.getSelectionColumnId(id), label, true, 50, id, selectedSubType);
        } else if (data.type === 'cat') {
          return categoricalCol(this.getSelectionColumnId(id), data.categories, label, true, 50, id, selectedSubType);
        }
        return numberCol2(this.getSelectionColumnId(id), data.domain[0], data.domain[1], label, true, 50, id, selectedSubType);
      });
  }

  protected loadSelectionColumnData(id: number, desc: any[]): Promise<IScoreRow<any>[]>[] {
    // TODO When playing the provenance graph, the RawDataTable is loaded before the GeneList has finished loading, i.e. that the local idType cache is not build yet and it will send an unmap request to the server
    const namePromise = this.resolveId(this.selection.idtype, id, this.idType);
    const url = `/targid/db/${this.dataSource.db}/${this.oppositeDataSource.base}_${this.dataSource.base}_single_score/filter`;
    const config = desc.map((option) => option.selectionOptions.id.split('-'));

    return <any>namePromise.then((name: string) => {
      return config.map((entry) => {
        const param = {
          table: entry[0],
          attribute: entry[1],
          name,
          species: getSelectedSpecies()
        };

        toFilter(param, convertRow2MultiMap(this.getParameter('filter')));
        return <Promise<IScoreRow<any>>>ajax.getAPIJSON(url, param);
      });
    });
  }

  protected mapSelectionRows(rows: IScoreRow<any>[], colDesc: any) {
    if (colDesc.selectionOptions.data.useForAggregation.indexOf('log2') !== -1) {
      rows = convertLog2ToLinear(rows, 'score');
    }

    return rows;
  }

  getItemName(count: number) {
    return (count === 1) ? gene.name.toLowerCase() : gene.name.toLowerCase() + 's';
  }
}

export default ACombinedTable;
