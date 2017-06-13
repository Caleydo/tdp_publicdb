/**
 * Created by Marc Streit on 26.07.2016.
 */

import * as ajax from 'phovea_core/src/ajax';
import {IViewContext, ISelection} from 'ordino/src/View';
import {
  stringCol, numberCol2, categoricalCol,
  ALineUpView2, IScoreRow
} from 'ordino/src/LineUpView';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {expression, copyNumber, mutation, IDataTypeConfig} from '../config';
import {convertLog2ToLinear} from '../utils';
import {ParameterFormIds, FORM_DATA_SOURCE, FORM_TISSUE_OR_CELLLINE_FILTER} from '../forms';
import {FormBuilder, IFormSelectDesc} from 'ordino/src/FormBuilder';
import {convertRow2MultiMap} from 'ordino/src/form/internal/FormMap';
import {toFilter} from '../utils';
import {FormElementType} from 'ordino/src/form';
import {loadFirstName} from './utils';

class RawDataTable extends ALineUpView2 {

  private readonly dataType: IDataTypeConfig;

  /**
   * Parameter UI form
   */
  private paramForm: FormBuilder;

  constructor(context: IViewContext, selection: ISelection, parent: Element, dataType: IDataTypeConfig, options?) {
    super(context, selection, parent, options);
    this.dataType = dataType;
  }

  buildParameterUI($parent: d3.Selection<any>, onChange: (name: string, value: any) => Promise<any>) {
    this.paramForm = new FormBuilder($parent);

    const paramDesc: IFormSelectDesc[] = [
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
    ];

    // map FormElement change function to provenance graph onChange function
    paramDesc.forEach((p) => {
      p.options.onChange = (selection, formElement) => onChange(formElement.id, selection.value);
    });

    this.paramForm.build(paramDesc);

    this.updateDataSource();

    // add other fields
    super.buildParameterUI($parent.select('form'), onChange);
  }

  private updateDataSource() {
    this.additionalScoreParameter = this.paramForm.getElementById(ParameterFormIds.DATA_SOURCE).value.data;
  }

  getParameter(name: string): any {
    return this.paramForm.getElementById(name).value.data;
  }

  setParameter(name: string, value: any) {
    this.paramForm.getElementById(name).value = value;
    this.updateDataSource();
    this.clear();
    return this.update();
  }

  protected loadColumnDesc() {
    const dataSource = this.getParameter(ParameterFormIds.DATA_SOURCE);
    return ajax.getAPIJSON(`/targid/db/${dataSource.db}/${dataSource.base}/desc`);
  }

  protected initColumns(desc) {
    super.initColumns(desc);

    const columns = [
      stringCol('id', 'Name', true, 120),
      //categoricalCol('species', desc.columns.species.categories, 'Species', true),
      categoricalCol('tumortype', desc.columns.tumortype.categories, 'Tumor Type', true),
      categoricalCol('organ', desc.columns.organ.categories, 'Organ', true),
      categoricalCol('gender', desc.columns.gender.categories, 'Gender', true)
    ];

    this.build([], columns);
    this.handleSelectionColumns(this.selection);

    return columns;
  }

  protected loadRows() {
    const dataSource = this.getParameter(ParameterFormIds.DATA_SOURCE);
    const url = `/targid/db/${dataSource.db}/${dataSource.base}/filter`;
    const param = {
      filter_species: getSelectedSpecies()
    };
    toFilter(param, convertRow2MultiMap(this.getParameter('filter')));
    return ajax.getAPIJSON(url, param);
  }

  protected async getSelectionColumnDesc(id: number) {
    const label = await this.getSelectionColumnLabel(id);
    const dataSubType = this.getParameter(ParameterFormIds.DATA_SUBTYPE);
    switch (dataSubType.type) {
      case 'boolean':
        return stringCol(this.getSelectionColumnId(id), label, true, 50, id);
      case 'string':
        return stringCol(this.getSelectionColumnId(id), label, true, 50, id);
      case 'cat':
        return categoricalCol(this.getSelectionColumnId(id), dataSubType.categories, label, true, 50, id);
    }
    return numberCol2(this.getSelectionColumnId(id), dataSubType.domain[0], dataSubType.domain[1], label, true, 50, id);
  }

  protected async getSelectionColumnLabel(id: number): Promise<string> {
    const dataSource = this.getParameter(ParameterFormIds.DATA_SOURCE);
    // resolve `_id` (= `targidid`) to symbol (`ensg`)
    // TODO When playing the provenance graph, the RawDataTable is loaded before the GeneList has finished loading, i.e. that the local idType cache is not build yet and it will send an unmap request to the server
    const ensg = await this.resolveId(this.selection.idtype, id, this.idType);
    return await loadFirstName(ensg);
  }

  protected async loadSelectionColumnData(id: number): Promise<IScoreRow<any>[]> {
    const dataSource = this.getParameter(ParameterFormIds.DATA_SOURCE);
    // TODO When playing the provenance graph, the RawDataTable is loaded before the GeneList has finished loading, i.e. that the local idType cache is not build yet and it will send an unmap request to the server
    const ensg = await this.resolveId(this.selection.idtype, id, this.idType);
    const url = `/targid/db/${dataSource.db}/${dataSource.base}_gene_single_score/filter`;
    const param = {
      table: this.dataType.tableName,
      attribute: this.getParameter(ParameterFormIds.DATA_SUBTYPE).id,
      name: ensg,
      species: getSelectedSpecies()
    };
    toFilter(param, convertRow2MultiMap(this.getParameter('filter')));
    return ajax.getAPIJSON(url, param);
  }

  protected mapSelectionRows(rows: IScoreRow<any>[]) {
    if (this.getParameter(ParameterFormIds.DATA_SUBTYPE).useForAggregation.indexOf('log2') !== -1) {
      rows = convertLog2ToLinear(rows, 'score');
    }

    if (this.getParameter(ParameterFormIds.DATA_SUBTYPE).type === 'cat') {
      rows = rows
        .filter((row) => row.score !== null)
        .map((row) => {
          row.score = row.score.toString();
          return row;
        });
    }

    return rows;
  }

  getItemName(count: number) {
    const dataSource = this.getParameter(ParameterFormIds.DATA_SOURCE);
    return (count === 1) ? dataSource.name.toLowerCase() : dataSource.name.toLowerCase() + 's';
  }
}


export function createExpressionTable(context: IViewContext, selection: ISelection, parent: Element, options?) {
  return new RawDataTable(context, selection, parent, expression, options);
}

export function createCopyNumberTable(context: IViewContext, selection: ISelection, parent: Element, options?) {
  return new RawDataTable(context, selection, parent, copyNumber, options);
}

export function createMutationTable(context: IViewContext, selection: ISelection, parent: Element, options?) {
  return new RawDataTable(context, selection, parent, mutation, options);
}
