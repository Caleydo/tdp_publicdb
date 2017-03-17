/**
 * Created by Holger Stitz on 06.12.2016.
 */

import {IViewContext, ISelection} from 'ordino/src/View';
import {ProxyView} from 'ordino/src/ProxyView';
import {IPluginDesc} from 'phovea_core/src/plugin';
import {IFormSelectOption} from 'ordino/src/FormBuilder';
import {loadGeneList} from './utils';
import {GENE_IDTYPE} from 'targid_common/src/constants';

/**
 * helper view for proxying an existing external website
 */
export default class GeneSymbolProxyView extends ProxyView {

  protected async getSelectionSelectData(ensgs: string[]): Promise<IFormSelectOption[]> {
    if (ensgs === null || ensgs.length === 0) {
      return Promise.resolve([]);
    }

    try {
      const ids = await this.resolveIds(this.selection.idtype, this.selection.range, GENE_IDTYPE);
      const geneList = await loadGeneList(ids);

      return geneList.map((d) => {
        return {
          name: d.symbol,
          value: d.symbol,
          data: d
        };
      });
    } catch(error) {
      console.error(error);
      this.setBusy(false);
    }
  }
}

export function create(context: IViewContext, selection: ISelection, parent: Element, options, plugin: IPluginDesc) {
  return new GeneSymbolProxyView(context, selection, parent, options, plugin);
}
