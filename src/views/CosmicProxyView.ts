import ProxyView from 'tdp_core/src/views/ProxyView';
import {IFormSelectOption} from 'tdp_core/src/form';
import {loadCelllineList} from './utils';

export default class CosmicProxyView extends ProxyView {

  protected async getSelectionSelectData(data: string[]): Promise<IFormSelectOption[]> {
    if (data === null || data.length === 0) {
      return Promise.resolve([]);
    }

    try {
      const ids = await this.resolveSelection();

      // TODO: only load selected cell lines
      const celllineList = await loadCelllineList(ids);

      return celllineList.map((d, i) => {
        return {
          name: `${d.celllinename} (${d.cosmicid})`,
          value: d.cosmicid,
          data: d
        };
      });
    } catch (error) {
      console.error(error);
      this.setBusy(false);
    }
  }
}
