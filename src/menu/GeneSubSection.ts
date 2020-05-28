/**
 * Created by Holger Stitz on 10.08.2016.
 */

import {gene} from '../config';
import {BaseUtils} from 'phovea_core';
import {ACommonSubSection} from 'tdp_gene';
import {IStartMenuSubSectionDesc} from 'tdp_gene';
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
    return BaseUtils.mixin(base, {
      search: searchGene,
      validate: validateGene,
      format: formatGene
    });
  }
}
