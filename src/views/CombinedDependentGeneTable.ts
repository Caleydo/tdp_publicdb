import {IViewContext, ISelection} from 'ordino/src/View';
import {
  stringCol, categoricalCol, IScoreRow
} from 'ordino/src/LineUpView';
import {
  gene,
  expression,
  copyNumber,
  mutation,
  IDataTypeConfig,
  chooseDataSource,
  IDataSourceConfig
} from '../config';
import {ParameterFormIds, FORM_GENE_FILTER} from '../forms';
import {FormBuilder, FormElementType} from 'ordino/src/FormBuilder';
import {IFormSelect2} from 'ordino/src/form/internal/FormSelect2';
import ACombinedTable from './ACombinedDependentTable';

class CombinedInvertedRawDataTable extends ACombinedTable {

  /**
   * Parameter UI form
   */
  protected paramForm: FormBuilder;

  protected dataSource: IDataSourceConfig;

  protected oppositeDataSource: IDataSourceConfig;

  constructor(context: IViewContext, selection: ISelection, parent: Element, dataType: IDataTypeConfig|IDataTypeConfig[], options?) {
    super(context, selection, parent, dataType, options);

    this.dataSource = chooseDataSource(context.desc);
    this.oppositeDataSource = gene;
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

  protected mapRows(rows: any[]) {
    rows = super.mapRows(rows);
    return rows;
  }

  protected getSelectionColumnLabel(id: number) {
    // TODO When playing the provenance graph, the RawDataTable is loaded before the GeneList has finished loading, i.e. that the local idType cache is not build yet and it will send an unmap request to the server
    return this.resolveId(this.selection.idtype, id, this.idType);
  }

  protected mapSelectionRows(rows: IScoreRow<any>[]) {
    const parameters = this.getParameter(ParameterFormIds.DATA_SUBTYPE).map((option) => option.id.split('-'));
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
