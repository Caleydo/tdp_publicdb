/**
 * Created by Samuel Gratzl on 27.04.2016.
 */

import {AView, IViewContext, ISelection, IView} from 'ordino/src/View';
import {getAPIJSON} from 'phovea_core/src/ajax';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {IDataSourceConfig, cellline, tissue, gene} from '../config';
import {Primitive} from 'd3';

export abstract class AInfoTable extends AView {

  private $table: d3.Selection<IView>;
  private $thead;
  private $tbody;

  private data: string[][];
  private fields: string[] = this.getFields();

  constructor(context: IViewContext, private selection: ISelection, parent: Element, private dataSource:IDataSourceConfig, options?) {
    super(context, parent, options);

    this.$table = this.$node
      .append('table')
      .classed('table table-striped table-hover table-bordered table-condensed', true);
    this.$thead = this.$table.append('thead').append('tr');
    this.$tbody = this.$table.append('tbody');

    this.changeSelection(selection);
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
    const results = await getAPIJSON(`/targid/db/${this.dataSource.db}/${this.dataSource.base}/filter`, {
      ['filter_'+this.dataSource.entityName]: ids,
      species: getSelectedSpecies()
    });
    this.data = this.transformData(results);
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

  private transformData(dbResults): string[][] {
    const header = ['Field Name'];

    const dataMap = new Map();
    dbResults.forEach((datum) => {
      header.push(datum.symbol);
      Object.keys(datum).forEach((key) => {
        if(key.startsWith('_')) {
          return;
        }
        const k = (key === 'id')? this.mapID() : key;
        if(!dataMap.has(k)) {
          dataMap.set(k, [datum[key]]);
        } else {
          dataMap.get(k).push(datum[key]);
        }
      });
    });

    // create a 2D array from where the first elements are the properties
    const body = Array
      .from(dataMap)
      .map((d) => [d[0], ...d[1]]);
    return [header, ...body];
  }

  private updateInfoTable(data: string[][]) {
    const $th = this.$thead.selectAll('th').data(data[0]);
    $th.enter().append('th');
    $th.text((d) => d);

    const $tr = this.$tbody.selectAll('tr').data(data.slice(1));
    //
    // // ENTER selection for table rows
    $tr.enter().append('tr');
    //
    // append td elements for each tr using a nested D3 selection
    // UPDATE selection for table rows
    const $td = $tr.selectAll('td').data((d) => d);

    // ENTER selection for table data
    $td.enter().append('td');

    // UPDATE selection for table data
    $td.text((d) => <Primitive>d);

    $td.exit().remove();
    $tr.exit().remove();
    $th.exit().remove();
  }

  protected abstract getFields();
  protected abstract mapID();
}

class CelllineInfoTable extends AInfoTable {
  constructor(context, selection, parent, options) {
    super(context, selection, parent, cellline, options);
  }

  protected getFields() {
    return [
      {
        key: 'celllinename',
        order: 10
      },
      {
        key: 'species',
        order: 20
      },
      {
        key: 'organ',
        order: 30
      },
      {
        key: 'tumortype',
        order: 40
      },
      {
        key: 'gender',
        order: 50
      }
    ];
  }

  protected mapID() {
    return 'celllinename';
  }
}

class GeneInfoTable extends AInfoTable {
  constructor(context, selection, parent, options) {
    super(context, selection, parent, gene, options);
  }

  protected getFields() {
    return [
      {
        key: 'ensg',
        order: 10
      },
      {
        key: 'species',
        order: 30
      },
      {
        key: 'symbol',
        order: 20
      },
      {
        key: 'chromosome',
        order: 40
      },
      {
        key: 'strand',
        order: 50
      },
      {
        key: 'biotype',
        order: 60
      },
      {
        key: 'seqregionstart',
        order: 70
      },
      {
        key: 'seqregionend',
        order: 80
      }
    ];
  }

  protected mapID() {
    return 'ensg';
  }
}

class TissueInfoTable extends AInfoTable {
  constructor(context, selection, parent, options) {
    super(context, selection, parent, tissue, options);
  }

  protected getFields() {
    return [
      {
        key: 'tissuename',
        order: 10
      },
      {
        key: 'species',
        order: 20
      },
      {
        key: 'organ',
        order: 30
      },
      {
        key: 'tumortype',
        order: 40
      },
      {
        key: 'gender',
        order: 50
      }
    ];
  }

  protected mapID() {
    return 'tissuename';
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
