/**
 * Created by Holger Stitz on 10.08.2016.
 */
import { gene } from '../config';
import { BaseUtils } from 'phovea_core';
import { ACommonSubSection } from 'tdp_gene';
import { formatGene, searchGene, validateGene } from '../utils';
/**
 * Entry point list from all species and LineUp named sets (aka stored LineUp sessions)
 */
export class GeneSubSection extends ACommonSubSection {
    constructor(parent, desc, options) {
        super(parent, desc, gene, options);
    }
    searchOptions() {
        const base = super.searchOptions();
        return BaseUtils.mixin(base, {
            search: searchGene,
            validate: validateGene,
            format: formatGene
        });
    }
}
//# sourceMappingURL=GeneSubSection.js.map