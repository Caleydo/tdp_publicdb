/**
 * Created by Samuel Gratzl on 27.04.2016.
 */

import { select, format, event as d3event, Selection } from 'd3v3';
import { IDTypeManager, SelectionUtils, SelectOperation, IDType } from 'visyn_core/idtype';
import { IView, AView, ErrorAlertHandler } from 'tdp_core';
import * as $ from 'jquery';
import { Categories } from '../common/Categories';
import 'jquery-ui/ui/widgets/sortable';

export interface ISample {
  name: string;
  id: string;
}

export interface IDataFormatRow {
  name: string;
  cn: number;
  expr: number;
  aa_mutated: boolean;
  sampleId: string;
}

export interface IDataFormat {
  id: string;
  geneName: string;
  ensg: string;
  alterationFreq: number;
  // with loaded rows
  promise: Promise<IDataFormat>;
  rows: IDataFormatRow[];
}

function unknownSample(sample: string, sampleId: string): IDataFormatRow {
  return {
    name: sample,
    sampleId,
    cn: Categories.unknownCopyNumberValue, // unknown --> see Common.
    expr: 0,
    aa_mutated: Categories.unknownMutationValue, // unknown
  };
}

function isMissingMutation(v: boolean) {
  return v === null || v === Categories.unknownMutationValue;
}

function isMissingCNV(v: number) {
  return v === null || v === Categories.unknownCopyNumberValue;
}

function computeAlterationFrequency(rows: IDataFormatRow[]) {
  if (rows.length === 0) {
    return 0;
  }
  const isMutated = (r: IDataFormatRow) => !isMissingMutation(r.aa_mutated) && r.aa_mutated === true;
  const isCopyNumberAltered = (r: IDataFormatRow) => !isMissingCNV(r.cn) && r.cn !== 0;
  const hasData = (r: IDataFormatRow) => !isMissingMutation(r.aa_mutated) || !isMissingCNV(r.cn);
  // reduce and compute both
  // amplified += 1 if isMutated or isCopyNumberAltered
  // total += if hasData
  const [amplified, total] = rows.reduce(([a, t], r) => [a + (isMutated(r) || isCopyNumberAltered(r) ? 1 : 0), t + (hasData(r) ? 1 : 0)], [0, 0]);
  // console.log(amplified, total);
  return total === 0 ? 0 : amplified / total; // handle division by 0
}

const FIRST_IS_NULL = 1; // null at the end

function compareCNV(a: number, b: number) {
  // order: >0, <0, 0, NaN
  if (a === b) {
    return 0;
  }
  if (a === undefined || a === null || Number.isNaN(a)) {
    return FIRST_IS_NULL;
  }
  if (b === undefined || b === null || Number.isNaN(b)) {
    return -FIRST_IS_NULL;
  }
  if (a > 0) {
    // b is 0 or < 0
    return -1;
  }
  if (b > 0) {
    // a is 0 or < 0
    return 1;
  }
  if (a < 0) {
    // b is 0
    return -1;
  }
  if (b < 0) {
    // a is 0
    return 1;
  }
  return 0;
}

function compareMutation(a: boolean, b: boolean) {
  // order: true, false, null
  if (a === b) {
    return 0;
  }
  if (a === undefined || a === null) {
    return FIRST_IS_NULL;
  }
  if (b === undefined || b === null) {
    return -FIRST_IS_NULL;
  }
  return a ? -1 : +1;
}

function sort(sampleList: string[], rows: IDataFormatRow[][]) {
  const rowLookups: any[] = rows.map((row) => {
    const r = {};
    row.forEach((d) => (r[d.name] = d));
    return r;
  });
  // sort such that missing values are in the end
  // hierarchy: cn, mut, expression
  function compare(a: string, b: string) {
    for (const row of rowLookups) {
      const aRow: IDataFormatRow = row[a];
      const bRow: IDataFormatRow = row[b];

      // undefined
      if (aRow === bRow) {
        // e.g. both undefined
        continue;
      }
      if (aRow === undefined || aRow === null) {
        return FIRST_IS_NULL; // for a not defined -> bigger
      }
      if (bRow === undefined || bRow === null) {
        return -FIRST_IS_NULL;
      }

      // first condition can be false positive, null vs 'null', so if both are missing don't compare
      if (aRow.cn !== bRow.cn && !(isMissingCNV(aRow.cn) && isMissingCNV(bRow.cn))) {
        return compareCNV(aRow.cn, bRow.cn);
      }
      if (aRow.aa_mutated !== bRow.aa_mutated && !(isMissingMutation(aRow.aa_mutated) && isMissingMutation(bRow.aa_mutated))) {
        return compareMutation(aRow.aa_mutated, bRow.aa_mutated);
      }
      // ignore not encoded expression value
      // if (a_row.expr !== b_row.expr) {
      //  return compareExpression(a_row.expr, b_row.expr);
      // }
    }
    // fallback to the name
    return a.localeCompare(b);
  }
  return sampleList.slice().sort(compare);
}

function byAlterationFrequency(a: IDataFormat, b: IDataFormat) {
  const aFrequency = a && a.alterationFreq !== undefined ? a.alterationFreq : 0;
  const bFrequency = b && b.alterationFreq !== undefined ? b.alterationFreq : 0;
  return bFrequency - aFrequency;
}

export abstract class AOncoPrint extends AView {
  private $table: Selection<IView>;

  private sampleListPromise: Promise<ISample[]> = null;

  /**
   * flag if the user specified the gene sorting order
   * @type {boolean}
   */
  private manuallyResorted = false;

  async init(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>) {
    await super.init(params, onParameterChange);

    // inject stats
    const base = <HTMLElement>params.querySelector('form') || params;
    base.insertAdjacentHTML(
      'afterbegin',
      `
    <div class="col-sm-auto my-2 oncoPrintScale" data-scale="">
      <button class="fas fa-search-minus"></button>
      <div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <button class="fas fa-search-plus"></button>
    </div>`,
    );

    let s = 0;
    const scaleElem = <HTMLElement>base.firstElementChild!;

    scaleElem.firstElementChild!.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      s = Math.min(s + 1, 3);
      scaleElem.dataset.scale = this.node.dataset.scale = 's'.repeat(s);
    });
    scaleElem.lastElementChild!.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      s = Math.max(s - 1, 0);
      scaleElem.dataset.scale = this.node.dataset.scale = 's'.repeat(s);
    });
  }

  protected initImpl() {
    super.initImpl();
    this.build();
    // load sample list with all available ids, then update the onco print
    this.sampleListPromise = this.loadSampleList();
    return this.sampleListPromise.then(this.updateChart.bind(this, false));
  }

  protected parameterChanged(name: string) {
    super.parameterChanged(name);
    this.sampleListPromise = this.loadSampleList();
    this.sampleListPromise.then(this.updateChart.bind(this, true));
  }

  protected selectionChanged() {
    super.selectionChanged();
    this.updateChart();
  }

  private build() {
    const $node = select(this.node);
    $node.classed('oncoPrint', true);

    this.$table = $node.append('div').classed('geneTableWrapper', true).append('table').append('tbody');

    const $legend = $node.append('div').classed('legend', true);

    const $cnLegend = $legend.append('ul');
    $cnLegend.append('li').classed('title', true).text('Copy Number');

    Categories.copyNumberCat.forEach((d) => {
      $cnLegend.append('li').attr('data-cnv', d.value).text(d.name);
    });
    // append the legend for missing values
    $cnLegend.append('li').attr('data-cnv', Categories.unknownCopyNumberValue).text('Missing Values');

    const $mutLegend = $legend.append('ul');
    $mutLegend.append('li').classed('title', true).text('Mutation');

    Categories.mutationCat.forEach((d) => {
      $mutLegend.append('li').attr('data-mut', d.value).text(d.name);
    });
    // append the legend for missing values
    $mutLegend.append('li').attr('data-mut', Categories.unknownMutationValue).text('Missing Values');

    $node.append('div').attr('class', 'alert alert-info alert-dismissible').attr('role', 'alert').html(`
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      <p>Please note:</p>
      <ul>
         <li>The indicated copy number states are only estimates, which can be affected by sample purity, ploidy, and other factors.</li>
         <li>The indicated alteration prevalences are only estimates, which can be affected by incomplete data and small sample numbers.</li>
      </ul>
    `);
  }

  protected abstract loadSampleList(): Promise<ISample[]>;
  protected abstract loadRows(ensg: string): Promise<IDataFormatRow[]>;

  protected abstract loadFirstName(ensg: string): Promise<string>;

  private logErrorAndMarkReady(error: any) {
    console.error(error);
    this.setBusy(false);
  }

  private updateChart(updateAll = false) {
    this.setBusy(true);

    const { ids } = this.selection;
    const { idtype } = this.selection;

    const empty = (id) => ({ id, geneName: '', ensg: '', alterationFreq: 0, rows: [], promise: null });
    // merge the old rows with the current selection
    const merge = (i: string[], old: IDataFormat[]) => {
      if (old.length === 0) {
        return i.map(empty);
      }
      const lookup = new Map<string, IDataFormat>();
      old.forEach((d) => lookup.set(d.id, d));
      if (this.manuallyResorted) {
        // different strategy if already resorted try to keep the original sorting as good as possible
        // keep old + newly added ones
        const existing = old.filter((d) => i.indexOf(d.id) >= 0);
        const added = i.filter((id) => !lookup.has(id)).map((id) => empty(id));
        return existing.concat(added);
      }
      return i.map((id) => lookup.get(id) || empty(id));
    };

    const data: IDataFormat[] = merge(ids, this.$table.selectAll('tr.gene').data());

    const $ids = this.$table.selectAll('tr.gene').data(data, (d) => String(d.id));
    const $idsEnter = $ids.enter().append('tr').classed('gene', true);

    // decide whether to load data for newly added items
    // or to reload the data for all items (e.g. due to parameter change)
    const enterOrUpdateAll = updateAll ? $ids : $idsEnter;

    const renderRow = ($id: Selection<IDataFormat>, d: IDataFormat) => {
      const promise = (d.ensg ? Promise.resolve(d.ensg) : IDTypeManager.getInstance().mapOneNameToFirstName(idtype, d.id, this.idType)).then((ensg: string) => {
        d.ensg = ensg;
        return Promise.all<any>([
          this.loadRows(ensg), // load always may have changed
          d.geneName || this.loadFirstName(ensg),
          this.sampleListPromise,
        ]);
      });

      // on error
      promise.catch(ErrorAlertHandler.getInstance().errorAlert).catch(this.logErrorAndMarkReady.bind(this));

      // on success
      d.promise = promise.then((input) => {
        d.rows = input[0];
        d.geneName = input[1];
        const samples = input[2];

        this.updateChartData(d, $id, samples);
        this.setBusy(false);
        return d;
      });
    };

    enterOrUpdateAll.each(function (d: IDataFormat) {
      renderRow(select(this), d);
    });

    // assume that all data will have a promise
    // wait for all data and then sort the things
    Promise.all([<Promise<any>>this.sampleListPromise].concat(data.map((d) => d.promise))).then((result: any[]) => {
      const samples: string[] = result.shift().map((d) => d.name);
      const rows = <IDataFormat[]>result;
      if (!this.manuallyResorted) {
        rows.sort(byAlterationFrequency);
      }
      const sortedSamples = sort(
        samples,
        rows.map((r) => r.rows),
      );
      const $genes = this.sortCells(sortedSamples);
      if (!this.manuallyResorted) {
        // sort genes=row by frequency
        $genes.sort(byAlterationFrequency);
      }
    });

    $ids
      .exit()
      .remove()
      .each(() => this.setBusy(false));

    // sortable
    (<any>$(this.$table.node())) // jquery
      .sortable({
        handle: 'th.geneLabel',
        axis: 'y',
        items: '> :not(.nodrag)',
        update: () => {
          this.manuallyResorted = true;
          // order has changed trigger a resort
          this.sampleListPromise.then((samples) => {
            const rows = <IDataFormat[]>this.$table.selectAll('tr.gene').data();
            const sortedSamples = sort(
              samples.map((d) => d.name),
              rows.map((r) => r.rows),
            );

            this.sortCells(sortedSamples);
          });
        },
      });
  }

  private updateChartData(data: IDataFormat, $parent: Selection<IDataFormat>, samples: ISample[]) {
    // console.log(data.geneName);
    let { rows } = data;
    rows = this.alignData(rows, samples);

    // count amplification/deletions and divide by total number of rows
    data.alterationFreq = computeAlterationFrequency(rows);

    const $th = $parent.selectAll('th.geneLabel').data([data]);
    $th.enter().append('th').classed('geneLabel', true);
    $th.html((d: any) => `<span class="alterationFreq">${format('.0%')(d.alterationFreq)}</span> ${d.geneName} <span class="ensg">${d.ensg}</span>`);
    $th.exit().remove();

    const $cells = $parent.selectAll('td.cell').data(rows);
    $cells
      .enter()
      .append('td')
      .classed('cell', true)
      .on('click', (row) => {
        this.selectSample(row.sampleId, SelectionUtils.toSelectOperation(<MouseEvent>d3event));
      })
      .append('div')
      .classed('mut', true);

    $cells
      .attr('data-title', (d) => d.name) // JSON.stringify(d))
      .attr('data-id', (d) => d.sampleId)
      .attr('data-cnv', (d) => String(isMissingCNV(d.cn) ? Categories.unknownCopyNumberValue : d.cn))
      .attr('data-mut', (d) => String(isMissingMutation(d.aa_mutated) ? Categories.unknownMutationValue : d.aa_mutated))
      .classed('selected', (d) => this.isSampleSelected(d.sampleId));

    $cells.exit().remove();

    if (rows.length === 0) {
      $parent.append('td').classed('cell', true);
    }
  }

  private isSampleSelected(sampleId: string) {
    const { ids } = this.getItemSelection();
    return ids.includes(sampleId);
  }

  private selectSample(sampleId: string, op: SelectOperation) {
    const { ids } = this.getItemSelection();
    const current = ids;
    let newSelection: string[] = null;
    switch (op) {
      case SelectOperation.SET:
        if (current.includes(sampleId)) {
          newSelection = [];
        } else {
          newSelection = [sampleId];
        }
        break;
      case SelectOperation.REMOVE:
        newSelection = current.filter((c) => c !== sampleId);
        break;
      case SelectOperation.ADD:
        newSelection = current.concat([sampleId]);
        break;
      default:
        break;
    }
    this.updateSelectionHighlight(newSelection);
    this.setItemSelection({ ids: newSelection, idtype: this.getSampleIdType() });
  }

  get itemIDType() {
    return this.getSampleIdType();
  }

  protected updateSelectionHighlight(range: string[]) {
    const table = <HTMLTableElement>this.$table.node();

    // TODO:: Figure out how to implement this optimization (just how to check if the range has selected every possible row)
    // if (range.isAll) {
    //   Array.from(table.querySelectorAll('td.cell')).forEach((c) => c.classList.add('selected'));
    //   return;
    // }

    Array.from(table.querySelectorAll('td.cell')).forEach((c) => c.classList.remove('selected'));
    range.forEach((sampleId: string) => {
      Array.from(table.querySelectorAll(`td.cell[data-id="${sampleId}"]`)).forEach((c) => c.classList.add('selected'));
    });
  }

  protected abstract getSampleIdType(): IDType;

  private sortCells(sortedSamples: string[]) {
    // name to index
    const lookup: any = {};
    sortedSamples.forEach((d, i) => (lookup[d] = i));

    const $genes = this.$table.selectAll('tr.gene');
    $genes.selectAll('td.cell').sort((a: IDataFormatRow, b: IDataFormatRow) => {
      const aIndex = lookup[a.name];
      const bIndex = lookup[b.name];
      // assume both exist
      return aIndex - bIndex;
    });
    return $genes;
  }

  private alignData(rows: IDataFormatRow[], samples: ISample[]) {
    // build hash map first for faster access
    const hash: any = {};
    rows.forEach((r) => (hash[r.name] = r));

    // align items --> fill missing values up to match sample list
    return samples.map((sample) => {
      // no data found --> add unknown sample
      if (!(sample.name in hash)) {
        return unknownSample(sample.name, sample.id);
      }
      const r = hash[sample.name];
      r.sampleId = sample.id;
      return r;
    });
  }
}
