/**
 * Created by Holger Stitz on 10.08.2016.
 */

import {gene} from '../config';
import {mixin} from 'phovea_core/src';
import {ACommonSubSection} from 'tdp_gene/src/menu/ACommonSubSection';
import {IStartMenuSubSectionDesc} from 'tdp_gene/src/extensions';
import {IStartMenuSectionOptions} from 'ordino/src/extensions';
import {formatGene, searchGene, validateGene} from '../utils';

/**
 * Entry point list from all species and LineUp named sets (aka stored LineUp sessions)
 */
export class GeneSubSection extends ACommonSubSection {

  constructor(parent: HTMLElement, desc: IStartMenuSubSectionDesc, options: IStartMenuSectionOptions) {
    super(parent, desc, gene, options);
  }

  protected searchOptions() {
    const base = super.searchOptions();
    return mixin(base, {
      search: searchGene,
      validate: validateGene,
      format: formatGene
    });
  }
}
