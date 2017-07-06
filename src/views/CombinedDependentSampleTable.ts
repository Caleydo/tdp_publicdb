import {IViewContext, ISelection} from 'ordino/src/View';
import {
  stringCol, categoricalCol
} from 'ordino/src/LineUpView';
import {
  gene,
  expression,
  copyNumber,
  mutation,
  IDataTypeConfig,
  IDataSourceConfig
} from '../config';
import {ParameterFormIds, FORM_DATA_SOURCE, FORM_TISSUE_OR_CELLLINE_FILTER} from '../forms';
import {FormBuilder, FormElementType} from 'ordino/src/FormBuilder';
import {IFormSelect2} from 'ordino/src/form/internal/FormSelect2';
import ACombinedTable from './ACombinedDependentTable';
import {loadFirstName} from './utils';

class CombinedRawDataTable extends ACombinedTable {

  /**
   * Parameter UI form
   */
  protected paramForm: FormBuilder;

  protected dataSource: IDataSourceConfig;

  protected oppositeDataSource: IDataSourceConfig;

  constructor(context: IViewContext, selection: ISelection, parent: Element, dataType: IDataTypeConfig|IDataTypeConfig[], options?) {
    super(context, selection, parent, dataType, options);

    this.dataSource = gene;
    this.dataType = Array.isArray(dataType)? dataType : [dataType];
  }

  buildParameterUI($parent: d3.Selection<any>, onChange: (name: string, value: any) => Promise<any>) {
    this.paramForm = new FormBuilder($parent);

    const paramDesc: IFormSelect2[] = [
      FORM_DATA_SOURCE,
      {
        type: FormElementType.SELECT2_MULTIPLE,
        label: 'Data Subtype',
        id: ParameterFormIds.DATA_SUBTYPE,
        attributes: {
          style: 'width: 500px;'
        },
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
      FORM_TISSUE_OR_CELLLINE_FILTER
    ];

    // map FormElement change function to provenance graph onChange function
    paramDesc.forEach((p) => {
      p.options.onChange = (selection, formElement) => onChange(formElement.id, selection && selection.value !== undefined ? selection.value : selection);
    });

    this.paramForm.build(paramDesc);

    this.updateDataSource();

    // add other fields
    super.buildParameterUI($parent.select('form'), onChange);
  }

  private updateDataSource() {
    this.oppositeDataSource = this.paramForm.getElementById(ParameterFormIds.DATA_SOURCE).value.data;
  }

  setParameter(name: string, value: any) {
    this.updateDataSource();
    return super.setParameter(name, value);
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

  protected mapRows(rows: any[]) {
    rows = super.mapRows(rows);
    return rows;
  }

  protected async getSelectionColumnLabel(id: number) {
    // TODO When playing the provenance graph, the RawDataTable is loaded before the GeneList has finished loading, i.e. that the local idType cache is not build yet and it will send an unmap request to the server
    const ensg = await this.resolveId(this.selection.idtype, id, this.idType);
    return await loadFirstName(ensg);
  }

  getItemName(count: number) {
    return (count === 1) ? gene.name.toLowerCase() : gene.name.toLowerCase() + 's';
  }
}

export function create(context: IViewContext, selection: ISelection, parent: Element, options?) {
  return new CombinedRawDataTable(context, selection, parent, [copyNumber, expression, mutation], options);
}
