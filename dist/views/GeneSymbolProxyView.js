/**
 * Created by Holger Stitz on 06.12.2016.
 */
import { ProxyView } from 'tdp_core';
import { loadGeneList } from './utils';
/**
 * helper view for proxying an existing external website
 */
export class GeneSymbolProxyView extends ProxyView {
    async getSelectionSelectData(ensgs) {
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
        }
        catch (error) {
            console.error(error);
            this.setBusy(false);
        }
    }
}
//# sourceMappingURL=GeneSymbolProxyView.js.map