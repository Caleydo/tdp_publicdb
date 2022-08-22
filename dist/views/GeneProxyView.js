/**
 * Created by Holger Stitz on 06.12.2016.
 */
import { ProxyView } from 'tdp_core';
import { SpeciesUtils } from '../common/common';
/**
 * helper view for proxying an existing external website
 */
export class GeneProxyView extends ProxyView {
    getSelectionSelectData(ensgs) {
        return SpeciesUtils.createOptions(ensgs, this.selection, this.idType);
    }
    updateProxyView() {
        const { extra } = this.options;
        extra.species = SpeciesUtils.getSelectedSpecies();
        super.updateProxyView();
    }
}
//# sourceMappingURL=GeneProxyView.js.map