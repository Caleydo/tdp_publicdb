/**
 * Created by Samuel Gratzl on 27.04.2016.
 */

import {ASmallMultipleView, IViewContext, ISelection, IView} from 'ordino/src/View';
import {getAPIJSON} from 'phovea_core/src/ajax';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {IDataSourceConfig, cellline, tissue, gene} from '../config';
import {FormBuilder, FormElementType, IFormSelectDesc, IFormSelectElement} from 'ordino/src/FormBuilder';
import {Primitive} from 'd3';

export abstract class AInfoTable extends ASmallMultipleView {

  private data: {[key: string]: string}[];
  private ids: string[];

  /**
   * Parameter UI form
   */
  private paramForm:FormBuilder;

  constructor(context: IViewContext, private selection: ISelection, parent: Element, private dataSource:IDataSourceConfig, options?) {
    super(context, selection, parent, options);

    this.changeSelection(selection);
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

  init() {
    super.init();
    this.$node
      .classed('infoTable', true);
  }

  async changeSelection(selection: ISelection) {
    this.selection = selection;
    return this.update();
  }

  private async fetchInformation() {
    const ids = await this.resolveIds(this.selection.idtype, this.selection.range, this.dataSource.idType);
    this.data = await getAPIJSON(`/targid/db/${this.dataSource.db}/${this.dataSource.base}/filter`, {
      ['filter_'+this.dataSource.entityName]: ids,
      species: getSelectedSpecies()
    });
  }

  private async update() {
    this.setBusy(true);

    try {
      await this.fetchInformation();
      this.setBusy(false);
      this.updateInfoTable(this.data);
    } catch(error) {
      console.error(error);
      this.setBusy(false);
    }
  }

  private updateInfoTable(data: {[key: string]: string}[]) {
    const $tables = this.$node.selectAll('table').data(data);

    const $table = $tables.enter()
      .append('table')
      .classed('table table-striped table-hover table-bordered table-condensed', true)
      .attr('style', 'width: 30%; margin: 0 1% 10px 0');

    $tables.exit().remove();

    const $thead = $table.append('thead');
    $thead.append('tr');
    $thead.append('th').text('Field Name');
    $thead.append('th').text('Data');

    const $tbody = $table.append('tbody');

    const $tr = $tbody.selectAll('tr').data((d) => {
      const tuples = [];
      Object.keys(d).forEach((key) => {
        if(key.startsWith('_')) {
          return;
        }
        tuples.push([key, d[key]]);
      });
      return tuples;
    });

    // ENTER selection for table rows
    $tr.enter().append('tr').attr('style', 'width: 1%; white-space: nowrap');

    // append td elements for each tr using a nested D3 selection
    // UPDATE selection for table rows
    const $td = $tr.selectAll('td').data((d) => d);

    // ENTER selection for table data
    $td.enter().append('td');

    // UPDATE selection for table data
    $td.text((d) => <Primitive>d);

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
