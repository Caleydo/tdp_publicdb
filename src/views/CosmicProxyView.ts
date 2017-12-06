/*
 * Created by Stefan Luger on 06.12.17
 */

import {cellline} from '../config';
import {getSelectedSpecies} from 'tdp_gene/src/common';
import {getTDPFilteredRows, IParams, IRow} from 'tdp_core/src/rest';
import {resolveIds} from 'tdp_core/src/views/resolve';
import ProxyView from 'tdp_core/src/views/ProxyView';
import {IFormSelectOption} from 'tdp_core/src/form/internal/FormSelect';

interface ICosmicRow extends IRow {
  celllinename: string,
  cosmicid: string,
}

export default class CosmicProxyView extends ProxyView {

  protected async getSelectionSelectData(cosmics: string[]): Promise<IFormSelectOption[]> {
    const ids = await resolveIds(this.selection.idtype, this.selection.range, cellline.idType);
    const params: IParams = {
      cosmics: '\'' + cosmics + '\'',
      species: getSelectedSpecies()
    };
    const results = await getTDPFilteredRows(cellline.db, `${cellline.base}`, params, {[cellline.entityName]: ids}, false);

    return Promise.resolve(results.map((d: ICosmicRow) => ({
      value: d.cosmicid,
      name: `${d.celllinename} (${d.cosmicid !== null ? d.cosmicid : 'empty'})`,
      data: d.cosmicid,
    })));
  }
}
