/**
 * Created by Samuel Gratzl on 29.01.2016.
 */

import { tsv } from 'd3';
import {
  IARankingViewOptions,
  ISelection,
  IViewContext,
  ARankingView,
  IAdditionalColumnDesc,
  ColumnDescUtils,
  FormElementType,
  IFormSelectElement,
  IDTypeManager,
  RestBaseUtils,
} from 'tdp_core';
import { LocalDataProvider, createSelectionDesc, createStackDesc, StackColumn } from 'lineupjs';
import { SpeciesUtils } from 'tdp_gene';

const SELECT_ID = 'genehopper_selection';

export class SimilarityView extends ARankingView {
  private loader: Promise<any> = null;

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<IARankingViewOptions> = {}) {
    super(
      context,
      selection,
      parent,
      Object.assign(options, {
        panelAddColumnBtnOptions: {
          btnClass: 'btn-primary',
        },
      }),
    );
    this.node.classList.add('genehopper_similarity');
  }

  protected getParameterFormDescs() {
    return super.getParameterFormDescs().concat([
      {
        type: FormElementType.SELECT,
        label: 'Show',
        id: SELECT_ID,
        options: {
          optionsData: [],
        },
      },
    ]);
  }

  get itemIDType() {
    return this.idType;
  }

  private async updateOptionsData() {
    const ids = await this.resolveSelection();
    const options = await SpeciesUtils.createOptions(ids, this.selection, this.idType);

    const select = this.getParameterElement(SELECT_ID);

    // backup entry and restore the selectedIndex by value afterwards again,
    // because the position of the selected element might change
    const bak = select.value;
    (<IFormSelectElement>select).updateOptionElements(options);

    if (bak !== null) {
      select.value = bak;
    }
  }

  static convertData(data: string) {
    return tsv.parse(data, (row: { [key: string]: any }) => {
      const strings = ['name', 'ensgid', 'hom'];
      Object.keys(row).forEach((name) => {
        if (strings.indexOf(name) < 0) {
          row[name] = +row[name];
        }
      });
      // (<any>row).id = KNOWN_GENES[(<any>row).name] || 22279;
      return row;
    });
  }

  private async loadImpl() {
    let gene = this.getParameter(SELECT_ID);
    if (!gene) {
      await this.updateOptionsData();
      gene = this.getParameter(SELECT_ID);
    }
    const data = await RestBaseUtils.getTDPProxyData('genehopper_similar', { gene: gene.value }, 'text');

    const rows = SimilarityView.convertData(data);
    const columns = [ColumnDescUtils.stringCol('name', { label: 'Name' }), ColumnDescUtils.stringCol('hom')];
    const cols = ['bas', 'brs', 'cll', 'gbp', 'gcc', 'gdi', 'gmf', 'hgs', 'hor', 'ipr', 'pup', 'sin', 'swp', 'tis', 'vap'];
    columns.push(...cols.map((d) => ColumnDescUtils.numberColFromArray(d, rows)));

    rows.forEach((row, i) => {
      row.id = row.ensgid;
    });
    return {
      idType: this.idType,
      columns,
      rows,
    };
  }

  private load() {
    if (this.loader === null) {
      this.loader = this.loadImpl();
    }
    return this.loader;
  }

  protected getColumnDescs(columns: any[]): IAdditionalColumnDesc[] {
    return columns;
  }

  protected loadColumnDesc() {
    return this.load();
  }

  protected loadRows() {
    return this.load().then((desc) => desc.rows);
  }

  protected parameterChanged(name: string) {
    super.parameterChanged(name);
    this.updateImpl();
  }

  protected selectionChanged() {
    super.selectionChanged();
    this.updateImpl();
  }

  private updateImpl() {
    this.updateOptionsData().then(() => {
      this.loader = null;
      this.rebuild();
    });
  }

  protected createInitialRanking(provider: LocalDataProvider) {
    const columns = provider.getColumns();
    const ranking = provider.pushRanking();
    ranking.push(provider.create(createSelectionDesc()));
    provider.push(ranking, columns[0]);
    const stack = <StackColumn>provider.push(ranking, createStackDesc('Combined'));
    columns
      .filter((d) => d.type === 'number')
      .forEach((d) => {
        const col = provider.create(d);
        col.setWidth(80);
        stack.push(col);
      });
    stack.sortByMe();
  }
}
