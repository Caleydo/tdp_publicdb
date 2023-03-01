/**
 * Created by Holger Stitz on 07.12.2016.
 */
import { IDTypeManager } from 'visyn_core';
import { FormElementType, ProxyView } from 'tdp_core';
import { GeneProxyView } from './GeneProxyView';
/**
 * helper view for proxying an existing external website
 */
export class UniProtProxyView extends GeneProxyView {
    initImpl() {
        super.initImpl();
        this.$node.classed('proxy_view', true);
        // update the selection first, then update the proxy view
        return this.updateSelectedItemSelect()
            .then(() => this.updateUniProtSelect())
            .catch(() => {
            this.updateProxyView();
        })
            .then(() => {
            this.updateProxyView();
        });
    }
    getParameterFormDescs() {
        return [
            {
                type: FormElementType.SELECT,
                label: 'Gene',
                id: ProxyView.FORM_ID_SELECTED_ITEM,
                options: {
                    optionsData: [],
                },
                useSession: true,
            },
            {
                type: FormElementType.SELECT,
                label: 'UniProt IDs for Selected Gene',
                id: UniProtProxyView.SELECTED_UNIPROT_ITEM,
                options: {
                    optionsData: [],
                },
                useSession: true,
            },
        ];
    }
    parameterChanged(name) {
        super.parameterChanged(name);
        if (name === ProxyView.FORM_ID_SELECTED_ITEM) {
            this.updateUniProtSelect()
                .catch(() => {
                this.updateProxyView();
            })
                .then(() => {
                this.updateProxyView();
            });
        }
        else if (name === UniProtProxyView.SELECTED_UNIPROT_ITEM) {
            this.updateProxyView();
        }
    }
    selectionChanged() {
        super.selectionChanged();
        // update the selection first, then update the proxy view
        this.updateSelectedItemSelect(true) // true = force use last selection
            .then(() => this.updateUniProtSelect(true)) // true = force use last selection
            .catch(() => {
            this.updateProxyView();
        })
            .then(() => {
            this.updateProxyView();
        });
    }
    updateUniProtSelect(forceUseLastSelection = false) {
        const selectedItemSelect = this.getParameterElement(UniProtProxyView.SELECTED_UNIPROT_ITEM);
        const ensg = this.getParameter(ProxyView.FORM_ID_SELECTED_ITEM).value;
        return IDTypeManager.getInstance()
            .mapOneNameToName(this.selection.idtype, ensg, UniProtProxyView.OUTPUT_IDTYPE)
            .then((uniProtIds) => {
            // use uniProtIds[0] since we passed only one selected _id
            if (uniProtIds === null) {
                return Promise.reject('Empty list of UniProt IDs');
            }
            return Promise.all([uniProtIds, this.getUniProtSelectData(uniProtIds)]);
        })
            .catch((reject) => {
            selectedItemSelect.setVisible(false);
            selectedItemSelect.updateOptionElements([]);
            return Promise.reject(reject);
        })
            .then((args) => {
            const uniProtIds = args[0]; // use names to get the last selected element
            const data = args[1];
            selectedItemSelect.setVisible(true);
            // backup entry and restore the selectedIndex by value afterwards again,
            // because the position of the selected element might change
            const bak = selectedItemSelect.value || data[selectedItemSelect.getSelectedIndex()];
            selectedItemSelect.updateOptionElements(data);
            // select last item from incoming `selection.range`
            if (forceUseLastSelection) {
                selectedItemSelect.value = data.filter((d) => d.value === uniProtIds[uniProtIds.length - 1])[0];
                // otherwise try to restore the backup
            }
            else if (bak !== null) {
                selectedItemSelect.value = bak;
            }
        });
    }
    getUniProtSelectData(uniProtIds) {
        if (uniProtIds === null) {
            return [];
        }
        return uniProtIds.map((d) => ({ value: d, name: d, data: d }));
    }
    updateProxyView() {
        this.loadProxyPage(this.getParameter(UniProtProxyView.SELECTED_UNIPROT_ITEM).value);
    }
}
UniProtProxyView.SELECTED_UNIPROT_ITEM = 'externalUniProt';
UniProtProxyView.OUTPUT_IDTYPE = 'UniProt_human';
//# sourceMappingURL=UniProtProxyView.js.map