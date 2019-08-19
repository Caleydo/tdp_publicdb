/*
 * Created by Stefan Luger on 06.12.17
 */

import {resolveIds} from 'tdp_core/src/views/resolve';
import ProxyView from 'tdp_core/src/views/ProxyView';
import {IFormSelectOption} from 'tdp_core/src/form/elements/FormSelect';

/**
 * Proxy view for the idType Cosmic which fetches the original cell line data based on the mapping from Cell line to
 * Cosmic.
 */
export default class CosmicProxyView extends ProxyView {

  protected async getSelectionSelectData(names: string[]): Promise<IFormSelectOption[]> {
    const cosmics = await resolveIds(this.selection.idtype, this.selection.range,'Cosmic');

    return Promise.resolve(cosmics.map((cosmicId: string, index: number) => ({
      value: cosmicId,
      name: `${names[index]} (${cosmicId || 'N/A'})`, // checks for empty string, undefined, and null
      data: cosmicId,
    })));
  }

  /**
   * Specific error message to display.
   * @param {string} selectedItemId The mapped cosmic id for the selected cell line.
   */
  protected showErrorMessage(selectedItemId: string) {
    super.showErrorMessage(selectedItemId);
    this.$node.html(`<p>This cell line is not available in the COSMIC database.</p>`);
  }
}
