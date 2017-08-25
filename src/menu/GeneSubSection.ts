/**
 * Created by Holger Stitz on 10.08.2016.
 */

import {gene} from '../config';
import {getTDPData, getTDPLookupUrl} from 'tdp_core/src/rest';
import {mixin} from 'phovea_core/src';
import {getSelectedSpecies} from 'tdp_gene/src/common';
import {ACommonSubSection} from 'tdp_gene/src/menu/ACommonSubSection';
import {IStartMenuSubSectionDesc} from 'tdp_gene/src/extensions';
import {IStartMenuSectionOptions} from 'ordino/src/extensions';

/**
 * Entry point list from all species and LineUp named sets (aka stored LineUp sessions)
 */
export default class GeneSubSection extends ACommonSubSection {

  constructor(parent: HTMLElement, desc: IStartMenuSubSectionDesc, options: IStartMenuSectionOptions) {
    super(parent, desc, gene, options);
  }

  protected searchOptions() {
    const base = super.searchOptions();
    return mixin(base, {
      ajax: {
        url: getTDPLookupUrl(this.dataSource.db, `${this.dataSource.base}_gene_items`),
      },
      templateResult: (item: any) => (item.id) ? `${item.text || ''} <span class="ensg">${item.id}</span>` : item.text,
      templateSelection: (item: any) => (item.id) ? `${item.text || ''} <span class="ensg">${item.id}</span>` : item.text
    });
  }


  protected validate(terms: string[]): Promise<{id: string, text: string}[]> {
    return getTDPData(this.dataSource.db, `${this.dataSource.base}_gene_items_verify/filter`, {
      species: getSelectedSpecies(),
      [`filter_symbol`]: terms,
    });
  }
}
