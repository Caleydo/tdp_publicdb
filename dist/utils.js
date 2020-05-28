import { getSelectedSpecies } from 'tdp_gene/src/common';
import { highlightMatch } from 'tdp_core/src/form/elements/Select3';
import { gene } from './config';
import { getTDPData, getTDPLookup } from 'tdp_core/src/rest';
// Gene
/**
 * Search and autocomplete of the input string for Select3
 *
 * @param {string} query An array of gene symbols
 * @param {number} page Server-side pagination page number
 * @param {number} pageSize Server-side pagination page size
 * @returns {Promise<{more: boolean; items: Readonly<IdTextPair>[]}>} Select3 conformant data structure.
 */
export function searchGene(query, page, pageSize) {
    return getTDPLookup(gene.db, gene.base + "_gene_items", {
        column: 'symbol',
        species: getSelectedSpecies(),
        query: query,
        page: page,
        limit: pageSize
    });
}
/**
 * Validation of a query input via paste or filedrop against the database for Select3
 *
 * @param {string[]} query An array of gene symbols
 * @returns {Promise<Readonly<IdTextPair>[]>} Return the validated gene symbols as id-text pairs.
 */
export function validateGene(query) {
    return getTDPData(gene.db, gene.base + "_gene_items_verify/filter", {
        column: 'symbol',
        species: getSelectedSpecies(),
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
export function formatGene(item, node, mode, currentSearchQuery) {
    if (mode === 'result') {
        //highlight match
        return item.text.replace(currentSearchQuery, highlightMatch) + " <span class=\"ensg\">" + item.id + "</span>";
    }
    return item.text;
}
// Cellline and Tissue Select3 options methods
export function search(config, query, page, pageSize) {
    return getTDPLookup(config.db, config.base + "_items", {
        column: config.entityName,
        species: getSelectedSpecies(),
        query: query,
        page: page,
        limit: pageSize
    });
}
export function validate(config, query) {
    var _a;
    return getTDPData(config.db, config.base + "_items_verify/filter", (_a = {
        column: config.entityName,
        species: getSelectedSpecies()
    },
        _a["filter_" + config.entityName] = query,
        _a));
}
export function format(item, node, mode, currentSearchQuery) {
    if (mode === 'result' && currentSearchQuery) {
        //highlight match
        return "" + item.text.replace(currentSearchQuery, highlightMatch);
    }
    return item.text;
}
//# sourceMappingURL=utils.js.map
//# sourceMappingURL=utils.js.map