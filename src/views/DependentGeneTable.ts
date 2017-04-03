/**
 * Created by Marc Streit on 28.07.2016.
 */

import * as ajax from 'phovea_core/src/ajax';
import {IViewContext, ISelection} from 'ordino/src/View';
import {
  stringCol, numberCol2, categoricalCol,
  ALineUpView2, IScoreRow
} from 'ordino/src/LineUpView';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {
  gene,
  expression,
  copyNumber,
  mutation,
  IDataTypeConfig,
  chooseDataSource,
  IDataSourceConfig
} from '../config';
import {ParameterFormIds, FORM_GENE_FILTER, FORM_DATA_SOURCE} from '../forms';
import {convertLog2ToLinear} from '../utils';
import {convertRow2MultiMap} from 'ordino/src/form/internal/FormMap';
import {toFilter} from '../utils';

import {FormBuilder, FormElementType, IFormSelectDesc} from 'ordino/src/FormBuilder';

class InvertedRawDataTable extends ALineUpView2 {

  private dataType: IDataTypeConfig;

  /**
   * Parameter UI form
   */
  private paramForm: FormBuilder;

  private dataSource: IDataSourceConfig;

  constructor(context: IViewContext, selection: ISelection, parent: Element, dataType: IDataTypeConfig, options?) {
    super(context, selection, parent, options);

    this.additionalScoreParameter = this.dataSource = chooseDataSource(context.desc);
    this.dataType = dataType;
  }

  buildParameterUI($parent: d3.Selection<any>, onChange: (name: string, value: any) => Promise<any>) {
    this.paramForm = new FormBuilder($parent);

    const paramDesc: IFormSelectDesc[] = [
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
    ];

    // map FormElement change function to provenance graph onChange function
    paramDesc.forEach((p) => {
      p.options.onChange = (selection, formElement) => onChange(formElement.id, selection.value);
    });

    this.paramForm.build(paramDesc);

    // add other fields
    super.buildParameterUI($parent.select('form'), onChange);
  }

  getParameter(name: string): any {
    return this.paramForm.getElementById(name).value.data;
  }

  setParameter(name: string, value: any) {
    this.paramForm.getElementById(name).value = value;
    this.clear();
    return this.update();
  }

  protected loadColumnDesc() {
    const dataSource = gene; //this.getParameter(ParameterFormIds.DATA_SOURCE);
    return ajax.getAPIJSON(`/targid/db/${dataSource.db}/${dataSource.base}/desc`);
  }

  protected initColumns(desc: {idType: string, columns: any}) {
    super.initColumns(desc);

    const columns = [
      stringCol('symbol', 'Symbol', true, 100),
      stringCol('id', 'Ensembl', true, 120),
      stringCol('chromosome', 'Chromosome', true, 150),
      //categoricalCol('species', desc.columns.species.categories, 'Species', true),
      categoricalCol('strand', [{label: 'reverse strand', name: String(-1)}, {
        label: 'forward strand',
        name: String(1)
      }], 'Strand', true),
      categoricalCol('biotype', desc.columns.biotype.categories, 'Biotype', true),
      stringCol('seqregionstart', 'Seq Region Start', false),
      stringCol('seqregionend', 'Seq Region End', false)
    ];

    this.build([], columns);
    this.handleSelectionColumns(this.selection);

    return columns;
  }

  protected loadRows() {
    const url = `/targid/db/${this.dataSource.db}/gene/filter`;
    const param = {
      species: getSelectedSpecies()
    };
    toFilter(param, convertRow2MultiMap(this.getParameter('filter')));
    return ajax.getAPIJSON(url, param);
  }

  protected mapRows(rows: any[]) {
    rows = super.mapRows(rows);
    return rows;
  }

  protected async getSelectionColumnDesc(id: number) {
    const label = await this.getSelectionColumnLabel(id);
    const dataSubType = this.getParameter(ParameterFormIds.DATA_SUBTYPE);

    if (dataSubType.type === 'boolean') {
      return stringCol(this.getSelectionColumnId(id), label, true, 50, id);
    } else if (dataSubType.type === 'string') {
      return stringCol(this.getSelectionColumnId(id), label, true, 50, id);
    } else if (dataSubType.type === 'cat') {
      return categoricalCol(this.getSelectionColumnId(id), dataSubType.categories, label, true, 50, id);
    }
    return numberCol2(this.getSelectionColumnId(id), dataSubType.domain[0], dataSubType.domain[1], label, true, 50, id);
  }

  protected getSelectionColumnLabel(id: number) {
    // TODO When playing the provenance graph, the RawDataTable is loaded before the GeneList has finished loading, i.e. that the local idType cache is not build yet and it will send an unmap request to the server
    return this.resolveId(this.selection.idtype, id);
  }

  protected async loadSelectionColumnData(id: number): Promise<IScoreRow<any>[]> {
    // TODO When playing the provenance graph, the RawDataTable is loaded before the GeneList has finished loading, i.e. that the local idType cache is not build yet and it will send an unmap request to the server
    const name = await this.resolveId(this.selection.idtype, id);
    const url = `/targid/db/${this.dataSource.db}/gene_${this.dataSource.base}_single_score/filter`;
    const param = {
      table: this.dataType.tableName,
      attribute: this.getParameter(ParameterFormIds.DATA_SUBTYPE).id,
      name,
      species: getSelectedSpecies()
    };
    toFilter(param, convertRow2MultiMap(this.getParameter('filter')));
    return ajax.getAPIJSON(url, param);
  }

  protected mapSelectionRows(rows: IScoreRow<any>[]) {
    if (this.getParameter(ParameterFormIds.DATA_SUBTYPE).useForAggregation.indexOf('log2') !== -1) {
      rows = convertLog2ToLinear(rows, 'score');
    }

    return rows;
  }

  getItemName(count: number) {
    return (count === 1) ? this.dataSource.name.toLowerCase() : this.dataSource.name.toLowerCase() + 's';
  }
}

export function createExpressionTable(context: IViewContext, selection: ISelection, parent: Element, options?) {
  return new InvertedRawDataTable(context, selection, parent, expression, options);
}

export function createCopyNumberTable(context: IViewContext, selection: ISelection, parent: Element, options?) {
  return new InvertedRawDataTable(context, selection, parent, copyNumber, options);
}

export function createMutationTable(context: IViewContext, selection: ISelection, parent: Element, options?) {
  return new InvertedRawDataTable(context, selection, parent, mutation, options);
}
