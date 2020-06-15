import { SpeciesUtils } from 'tdp_gene';
import { Select3Utils } from 'tdp_core';
import { gene } from './config';
import { RestBaseUtils } from 'tdp_core';
// Gene
export class GeneUtils {
    /**
     * Search and autocomplete of the input string for Select3
     *
     * @param {string} query An array of gene symbols
     * @param {number} page Server-side pagination page number
     * @param {number} pageSize Server-side pagination page size
     * @returns {Promise<{more: boolean; items: Readonly<IdTextPair>[]}>} Select3 conformant data structure.
     */
    static searchGene(query, page, pageSize) {
        return RestBaseUtils.getTDPLookup(gene.db, `${gene.base}_gene_items`, {
            column: 'symbol',
            species: SpeciesUtils.getSelectedSpecies(),
            query,
            page,
            limit: pageSize
        });
    }
    /**
     * Validation of a query input via paste or filedrop against the database for Select3
     *
     * @param {string[]} query An array of gene symbols
     * @returns {Promise<Readonly<IdTextPair>[]>} Return the validated gene symbols as id-text pairs.
     */
    static validateGene(query) {
        return RestBaseUtils.getTDPData(gene.db, `${gene.base}_gene_items_verify/filter`, {
            column: 'symbol',
            species: SpeciesUtils.getSelectedSpecies(),
            filter_symbol: query,
        });
    }
    /**
     * Formatting of genes within Select3 Searchbox.
     *
     * @param {ISelect3Item<IdTextPair>} item The single gene id-text pair.
     * @param {HTMLElement} node The HTML Element in the DOM.
     * @param {"result" | "selection"} mode The search result items within the dropdown or the selected items inside the search input field.
     * @param {RegExp} currentSearchQuery The actual search query input.
     * @returns {string} The string how the gene is actually rendered.
     */
    static formatGene(item, node, mode, currentSearchQuery) {
        if (mode === 'result') {
            //highlight match
            return `${item.text.replace(currentSearchQuery, Select3Utils.highlightMatch)} <span class="ensg">${item.id}</span>`;
        }
        return item.text;
    }
    // Cellline and Tissue Select3 options methods
    static search(config, query, page, pageSize) {
        return RestBaseUtils.getTDPLookup(config.db, `${config.base}_items`, {
            column: config.entityName,
            species: SpeciesUtils.getSelectedSpecies(),
            query,
            page,
            limit: pageSize
        });
    }
    static validate(config, query) {
        return RestBaseUtils.getTDPData(config.db, `${config.base}_items_verify/filter`, {
            column: config.entityName,
            species: SpeciesUtils.getSelectedSpecies(),
            [`filter_${config.entityName}`]: query,
        });
    }
    static format(item, node, mode, currentSearchQuery) {
        if (mode === 'result' && currentSearchQuery) {
            //highlight match
            return `${item.text.replace(currentSearchQuery, Select3Utils.highlightMatch)}`;
        }
        return item.text;
    }
}
//# sourceMappingURL=GeneUtils.js.map