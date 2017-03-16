/**
 * Created by Samuel Gratzl on 27.04.2016.
 */

import {AView, IViewContext, ISelection, IView} from 'ordino/src/View';
import {getAPIJSON} from 'phovea_core/src/ajax';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {IDataSourceConfig, cellline, tissue, gene} from '../config';
import {FormBuilder, FormElementType, IFormSelectDesc, IFormSelectElement} from 'ordino/src/FormBuilder';
import {ParameterFormIds} from '../forms';


export abstract class AInfoTable extends AView {

  private $table:d3.Selection<IView>;
  private $thead;
  private $tbody;

  private selectedItems: string[];
  private data: any;

  /**
   * Parameter UI form
   */
  private paramForm:FormBuilder;

  constructor(context: IViewContext, private selection: ISelection, parent: Element, private dataSource:IDataSourceConfig, options?) {
    super(context, parent, options);

    this.changeSelection(selection);
  }

  buildParameterUI($parent: d3.Selection<any>, onChange: (name: string, value: any)=>Promise<any>) {
    this.paramForm = new FormBuilder($parent);

    const paramDesc:IFormSelectDesc[] = [
      {
        type: FormElementType.SELECT,
        label: 'Show',
        id: ParameterFormIds.DATA_SOURCE,
        options: {
          optionsData: []
        }
      }
    ];

    // map FormElement change function to provenance graph onChange function
    // the view's setParameter method is called with some indirections down the line
    paramDesc.forEach((p) => {
      p.options.onChange = (selection, formElement) => onChange(formElement.id, selection.value);
    });

    this.paramForm.build(paramDesc);

    // add other fields
    super.buildParameterUI($parent.select('form'), onChange);
  }

  getParameter(name: string): any {
    if(this.paramForm.getElementById(name).value === null) {
      return '';
    }

    return this.paramForm.getElementById(name).value;
  }

  async setParameter(name: string, value: any) {
    this.paramForm.getElementById(name).value = value;
    this.update();
  }

  private async updateOptionsData() {
    const optionsConfig = this.selectedItems.map((d) => {
      return {
        value: d,
        name: d,
        data: d
      };
    });

    const select = this.paramForm.getElementById(ParameterFormIds.DATA_SOURCE);

    // backup entry and restore the selectedIndex by value afterwards again,
    // because the position of the selected element might change
    const bak = select.value;
    (<IFormSelectElement>select).updateOptionElements(optionsConfig);

    if(bak !== null) {
      select.value = bak;
    }
  }

  init() {
    super.init();

    this.$node.classed('infoTable', true);

    this.$table = this.$node
      .append('table').classed('table table-striped table-hover table-bordered table-condensed', true);

    this.$thead = this.$table.append('thead');
    this.$thead.append('tr');
    this.$thead.append('th').text('Column');
    this.$thead.append('th').text('Data');

    this.$tbody = this.$table.append('tbody');
  }

  async changeSelection(selection: ISelection) {
    this.selection = selection;
    await this.resolveSelectedItems();
    await this.updateOptionsData();
    return this.update();
  }

  private async resolveSelectedItems() {
    this.selectedItems = await this.resolveIds(this.selection.idtype, this.selection.range, this.dataSource.idType);
  }

  private async fetchInformation() {
    const selection: { name: string, value: string, data: string } = this.paramForm.getElementById(ParameterFormIds.DATA_SOURCE).value;
    this.data = await getAPIJSON(`/targid/db/${this.dataSource.db}/row`, {
        entities: `'${selection.value}'`,
        schema: this.dataSource.schema,
        table_name: this.dataSource.tableName,
        entity_name: this.dataSource.entityName,
        species: getSelectedSpecies()
      });
  }

  private async update() {
    this.setBusy(true);

    try {
      await this.fetchInformation();
      this.setBusy(false);
      this.updateInfoTable(this.data[0]);
    } catch(error) {
      console.error(error);
      this.setBusy(false);
    }
  }

  private updateInfoTable(data: {[key: string]: string}) {
    const tuples = [];
    for(const key in data) {
      if(data.hasOwnProperty(key)) {
        tuples.push([key, data[key]]);
      }
    }

    const $tr = this.$tbody.selectAll('tr').data(tuples);

    // ENTER selection for table rows
    $tr.enter().append('tr');

    // append td elements for each tr using a nested D3 selection
    // UPDATE selection for table rows
    const $td = $tr.selectAll('td').data((d) => d);

    // ENTER selection for table data
    $td.enter().append('td');

    // UPDATE selection for table data
    $td.text((d) => d);

    $tr.exit().remove();
  }
}

class CelllineInfoTable extends AInfoTable {
  constructor(context, selection, parent, options) {
    super(context, selection, parent, cellline, options);
  }
}

class GeneInfoTable extends AInfoTable {
  constructor(context, selection, parent, options) {
    super(context, selection, parent, gene, options);
  }
}

class TissueInfoTable extends AInfoTable {
  constructor(context, selection, parent, options) {
    super(context, selection, parent, tissue, options);
  }
}

export function createCelllineInfoTable(context:IViewContext, selection: ISelection, parent:Element, options?) {
  return new CelllineInfoTable(context, selection, parent, options);
}

export function createGeneInfoTable(context:IViewContext, selection: ISelection, parent:Element, options?) {
  return new GeneInfoTable(context, selection, parent, options);
}

export function createTissueInfoTable(context:IViewContext, selection: ISelection, parent:Element, options?) {
  return new TissueInfoTable(context, selection, parent, options);
}
