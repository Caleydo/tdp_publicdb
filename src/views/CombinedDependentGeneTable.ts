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
import {IFormSelect2} from 'ordino/src/form/internal/FormSelect2';

class CombinedInvertedRawDataTable extends ALineUpView2 {

  private dataType: IDataTypeConfig[];

  /**
   * Parameter UI form
   */
  private paramForm: FormBuilder;

  private dataSource: IDataSourceConfig;

  constructor(context: IViewContext, selection: ISelection, parent: Element, dataType: IDataTypeConfig|IDataTypeConfig[], options?) {
    super(context, selection, parent, options);

    this.additionalScoreParameter = this.dataSource = chooseDataSource(context.desc);
    this.dataType = Array.isArray(dataType)? dataType : [dataType];
  }

  buildParameterUI($parent: d3.Selection<any>, onChange: (name: string, value: any) => Promise<any>) {
    this.paramForm = new FormBuilder($parent);

    const paramDesc: IFormSelect2[] = [
      {
        type: FormElementType.SELECT2_MULTIPLE,
        label: 'Data Subtype',
        id: ParameterFormIds.DATA_SUBTYPE,
        options: {
          data: this.dataType.map((ds) => {
            return {
              text: ds.name,
              children: ds.dataSubtypes.map((dss) => {
                return {text: dss.name, id: `${ds.tableName}-${dss.id}`, data: dss};
              })
            };
          })
        },
        useSession: true
      },
      FORM_GENE_FILTER
    ];

    // map FormElement change function to provenance graph onChange function
    // TODO: add onChange field to IFormElementDesc.options?
    paramDesc.forEach((p) => {
      p.options.onChange = (selection, formElement) => onChange(formElement.id, selection.value);
    });

    this.paramForm.build(paramDesc);

    // add other fields
    super.buildParameterUI($parent.select('form'), onChange);
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
    const dataSource = gene; //this.getParameter(ParameterFormIds.DATA_SOURCE);
    return ajax.getAPIJSON(`/targid/db/${dataSource.db}/${dataSource.base}/desc`);
  }

  protected initColumns(desc: {idType: string, columns: any}) {
    super.initColumns(desc);

    const columns = [
      stringCol('symbol', 'Symbol', true, 100),
      stringCol('id', 'Ensembl', true, 120),
      stringCol('name', 'Name', true),
      stringCol('chromosome', 'Chromosome', true, 150),
      //categoricalCol('species', desc.columns.species.categories, 'Species', true),
      categoricalCol('biotype', desc.columns.biotype.categories, 'Biotype', true),
      categoricalCol('strand', [{ label: 'reverse strand', name:String(-1)}, { label: 'forward strand', name:String(1)}], 'Strand', false),
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

  protected getSelectionColumnLabel(id: number) {
    // TODO When playing the provenance graph, the RawDataTable is loaded before the GeneList has finished loading, i.e. that the local idType cache is not build yet and it will send an unmap request to the server
    return this.resolveId(this.selection.idtype, id, this.idType);
  }

  protected loadSelectionColumnData(id: number): Promise<IScoreRow<any>[][]> {
    // TODO When playing the provenance graph, the RawDataTable is loaded before the GeneList has finished loading, i.e. that the local idType cache is not build yet and it will send an unmap request to the server
    const namePromise = this.resolveId(this.selection.idtype, id, this.idType);
    const url = `/targid/db/${this.dataSource.db}/gene_${this.dataSource.base}_single_score/filter`;
    const config = this.getParameter(ParameterFormIds.DATA_SUBTYPE).map((option) => option.id.split('-'));

    const r = namePromise.then((name: string) => {
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

    return r;
  }

  protected mapSelectionRows(rows: IScoreRow<any>[]) {
    const parameters = this.getParameter(ParameterFormIds.DATA_SUBTYPE).map((option) => option.id.split('-'));
    console.log('ROWS', rows);
    // TODO: find correct parameter data to check useForAggregation
    // if (this.getParameter(ParameterFormIds.DATA_SUBTYPE).useForAggregation.indexOf('log2') !== -1) {
    //   rows = convertLog2ToLinear(rows, 'score');
    // }

    return rows;
  }

  getItemName(count: number) {
    return (count === 1) ? gene.name.toLowerCase() : gene.name.toLowerCase() + 's';
  }
}

export function create(context: IViewContext, selection: ISelection, parent: Element, options?) {
  return new CombinedInvertedRawDataTable(context, selection, parent, [copyNumber, expression, mutation], options);
}
