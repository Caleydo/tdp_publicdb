import {SpeciesUtils} from 'tdp_gene';
import {Select3Utils, ISelect3Item} from 'tdp_core';
import {gene, IDataSourceConfig} from './config';
import {RestBaseUtils} from 'tdp_core';
import {ICommonDBConfig} from 'tdp_gene';

// Gene

/**
 * Search and autocomplete of the input string for Select3
 *
 * @param {string} query An array of gene symbols
 * @param {number} page Server-side pagination page number
 * @param {number} pageSize Server-side pagination page size
 * @returns {Promise<{more: boolean; items: Readonly<IdTextPair>[]}>} Select3 conformant data structure.
 */
export function searchGene(query: string, page: number, pageSize: number): Promise<{ more: boolean, items: Readonly<IdTextPair>[] }> {
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
export function validateGene(query: string[]): Promise<Readonly<IdTextPair>[]> {
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
export function formatGene(item: ISelect3Item<IdTextPair>, node: HTMLElement, mode: 'result' | 'selection', currentSearchQuery?: RegExp) {
  if (mode === 'result') {
    //highlight match
    return `${item.text.replace(currentSearchQuery!, Select3Utils.highlightMatch)} <span class="ensg">${item.id}</span>`;
  }
  return item.text;
}

// Cellline and Tissue Select3 options methods

export function search(config: IDataSourceConfig | ICommonDBConfig, query: string, page: number, pageSize: number): Promise<{ more: boolean, items: Readonly<IdTextPair>[] }> {
  return RestBaseUtils.getTDPLookup(config.db, `${config.base}_items`, {
    column: config.entityName,
    species: SpeciesUtils.getSelectedSpecies(),
    query,
    page,
    limit: pageSize
  });
}

export function validate(config: IDataSourceConfig | ICommonDBConfig, query: string[]): Promise<Readonly<IdTextPair>[]> {
  return RestBaseUtils.getTDPData(config.db, `${config.base}_items_verify/filter`, {
    column: config.entityName,
    species: SpeciesUtils.getSelectedSpecies(),
    [`filter_${config.entityName}`]: query,
  });
}

export function format(item: ISelect3Item<IdTextPair>, node: HTMLElement, mode: 'result' | 'selection', currentSearchQuery?: RegExp) {
  if (mode === 'result' && currentSearchQuery) {
    //highlight match
    return `${item.text.replace(currentSearchQuery!, Select3Utils.highlightMatch)}`;
  }
  return item.text;
}
