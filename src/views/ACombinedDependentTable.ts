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
import {toFilter} from '../utils';
import {FormBuilder} from 'ordino/src/FormBuilder';

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
    this.clear();
    return this.update();
  }

  protected loadColumnDesc() {
    return ajax.getAPIJSON(`/targid/db/${this.oppositeDataSource.db}/${this.oppositeDataSource.base}/desc`);
  }

  protected loadRows() {
    const url = `/targid/db/${this.dataSource.db}/gene/filter`;
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
    const dataSubTypes = this.getParameter(ParameterFormIds.DATA_SUBTYPE);

    return dataSubTypes.map((dataSubType) => {
      const label = `${selectedItem} (${dataSubType.text})`;
      const data = dataSubType.data;
      if (data.type === 'boolean') {
        return stringCol(this.getSelectionColumnId(id), label, true, 50, id);
      } else if (data.type === 'string') {
        return stringCol(this.getSelectionColumnId(id), label, true, 50, id);
      } else if (data.type === 'cat') {
        return categoricalCol(this.getSelectionColumnId(id), data.categories, label, true, 50, id);
      }
      return numberCol2(this.getSelectionColumnId(id), data.domain[0], data.domain[1], label, true, 50, id);
    });
  }

  protected loadSelectionColumnData(id: number): Promise<IScoreRow<any>[][]> {
    // TODO When playing the provenance graph, the RawDataTable is loaded before the GeneList has finished loading, i.e. that the local idType cache is not build yet and it will send an unmap request to the server
    const namePromise = this.resolveId(this.selection.idtype, id, this.idType);
    const url = `/targid/db/${this.dataSource.db}/gene_${this.dataSource.base}_single_score/filter`;
    const config = this.getParameter(ParameterFormIds.DATA_SUBTYPE).map((option) => option.id.split('-'));

    return namePromise.then((name: string) => {
      return config.map((entry) => {
        const param = {
          table: entry[0],
          attribute: entry[1],
          name,
          species: getSelectedSpecies()
        };

        toFilter(param, convertRow2MultiMap(this.getParameter('filter')));
        return ajax.getAPIJSON(url, param);
      });
    }).then((requests: Promise<IScoreRow<any>[]>[]) => {
      return requests;
    });
  }

  getItemName(count: number) {
    return (count === 1) ? gene.name.toLowerCase() : gene.name.toLowerCase() + 's';
  }
}

export default ACombinedTable;
