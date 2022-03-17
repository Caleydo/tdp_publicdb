/*
 * Created by Stefan Luger on 06.12.17
 */

import { ProxyView, IFormSelectOption, IDTypeManager } from 'tdp_core';

/**
 * Proxy view for the idType Cosmic which fetches the original cell line data based on the mapping from Cell line to
 * Cosmic.
 */
export class CosmicProxyView extends ProxyView {
  protected async getSelectionSelectData(names: string[]): Promise<IFormSelectOption[]> {
    const cosmics = await IDTypeManager.getInstance().mapNameToFirstName(this.selection.idtype, this.selection.ids, 'Cosmic');

    return Promise.resolve(
      cosmics.map((cosmicId: string, index: number) => ({
        value: cosmicId,
        name: `${names[index]} (${cosmicId || 'N/A'})`, // checks for empty string, undefined, and null
        data: cosmicId,
      })),
    );
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
