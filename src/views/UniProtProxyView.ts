/**
 * Created by Holger Stitz on 07.12.2016.
 */

import { IDTypeManager } from 'visyn_core/idtype';
import { FormElementType, IFormSelectElement, ProxyView } from 'tdp_core';
import { GeneProxyView } from './GeneProxyView';

/**
 * helper view for proxying an existing external website
 */
export class UniProtProxyView extends GeneProxyView {
  static SELECTED_UNIPROT_ITEM = 'externalUniProt';

  static readonly OUTPUT_IDTYPE = 'UniProt_human';

  protected initImpl() {
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

  protected getParameterFormDescs() {
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

  protected parameterChanged(name: string) {
    super.parameterChanged(name);
    if (name === ProxyView.FORM_ID_SELECTED_ITEM) {
      this.updateUniProtSelect()
        .catch(() => {
          this.updateProxyView();
        })
        .then(() => {
          this.updateProxyView();
        });
    } else if (name === UniProtProxyView.SELECTED_UNIPROT_ITEM) {
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

  private updateUniProtSelect(forceUseLastSelection = false) {
    const selectedItemSelect: IFormSelectElement = <IFormSelectElement>this.getParameterElement(UniProtProxyView.SELECTED_UNIPROT_ITEM);

    const ensg = this.getParameter(ProxyView.FORM_ID_SELECTED_ITEM).value;

    return IDTypeManager.getInstance()
      .mapOneNameToName(this.selection.idtype, ensg, UniProtProxyView.OUTPUT_IDTYPE)
      .then((uniProtIds: string[]) => {
        // use uniProtIds[0] since we passed only one selected _id
        if (uniProtIds === null) {
          return Promise.reject('Empty list of UniProt IDs');
        }
        return Promise.all<any>([uniProtIds, this.getUniProtSelectData(uniProtIds)]);
      })
      .catch((reject) => {
        selectedItemSelect.setVisible(false);
        selectedItemSelect.updateOptionElements([]);
        return Promise.reject(reject);
      })
      .then((args: any[]) => {
        const uniProtIds = <string[]>args[0]; // use names to get the last selected element
        const data = <{ value: string; name: string; data: string }[]>args[1];

        selectedItemSelect.setVisible(true);

        // backup entry and restore the selectedIndex by value afterwards again,
        // because the position of the selected element might change
        const bak = selectedItemSelect.value || data[(<IFormSelectElement>selectedItemSelect).getSelectedIndex()];
        selectedItemSelect.updateOptionElements(data);

        // select last item from incoming `selection.range`
        if (forceUseLastSelection) {
          selectedItemSelect.value = data.filter((d) => d.value === uniProtIds[uniProtIds.length - 1])[0];

          // otherwise try to restore the backup
        } else if (bak !== null) {
          selectedItemSelect.value = bak;
        }
      });
  }

  private getUniProtSelectData(uniProtIds: string[]): { value: string; name: string; data: string }[] {
    if (uniProtIds === null) {
      return [];
    }

    return uniProtIds.map((d: string) => ({ value: d, name: d, data: d }));
  }

  protected updateProxyView() {
    this.loadProxyPage(this.getParameter(UniProtProxyView.SELECTED_UNIPROT_ITEM).value);
  }
}
