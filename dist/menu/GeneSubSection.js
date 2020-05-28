/**
 * Created by Holger Stitz on 10.08.2016.
 */
import { gene } from '../config';
import { mixin } from 'phovea_core/src';
import { ACommonSubSection } from 'tdp_gene/src/menu/ACommonSubSection';
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
        return mixin(base, {
            search: searchGene,
            validate: validateGene,
            format: formatGene
        });
    }
}
//# sourceMappingURL=GeneSubSection.js.map