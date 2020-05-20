/**
 * Created by Holger Stitz on 06.12.2016.
 */

import {IViewContext, ISelection} from 'tdp_core/src/views';
import ProxyView from 'tdp_core/src/views/ProxyView';
import {IPluginDesc} from 'phovea_core/src/plugin';
import {IFormSelectOption} from 'tdp_core/src/form';
import {loadGeneList} from './utils';

/**
 * helper view for proxying an existing external website
 */
export class GeneSymbolProxyView extends ProxyView {

  protected async getSelectionSelectData(ensgs: string[]): Promise<IFormSelectOption[]> {
    if (ensgs === null || ensgs.length === 0) {
      return Promise.resolve([]);
    }

    try {
      const ids = await this.resolveSelection();
      const geneList = await loadGeneList(ids);

      return geneList.map((d, i) => {
        return {
          name: `${d.symbol} (${d.id})`,
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
