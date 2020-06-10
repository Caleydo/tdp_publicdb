import {getSelectedSpecies} from 'tdp_gene/src/common';
import {highlightMatch, ISelect3Item} from 'tdp_core/src/form/elements/Select3';
import {gene, IDataSourceConfig, drug} from './config';
import {getTDPData, getTDPLookup} from 'tdp_core/src/rest';
import {ICommonDBConfig} from 'tdp_gene/src/views/ACommonList';

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
  return getTDPLookup(gene.db, `${gene.base}_gene_items`, {
    column: 'symbol',
    species: getSelectedSpecies(),
    query,
    page,
    limit: pageSize
  });
}

interface IDrugData extends IdTextPair {
  target?: string;
  moa?: string;
}

/**
 * Search and autocomplete of the input string for Select3
 *
 * @param {string} query An array of gene symbols
 * @param {number} page Server-side pagination page number
 * @param {number} pageSize Server-side pagination page size
 * @returns {Promise<{more: boolean; items: Readonly<IDrugData>[]}>} Select3 conformant data structure.
 */
export function searchDrug(query: string, page: number, pageSize: number): Promise<{more: boolean, items: Readonly<IDrugData>[]}> {
  return getTDPLookup(drug.db, `${drug.base}_drug_items`, {
    column: 'drugid',
    species: getSelectedSpecies(),
    query,
    page,
    limit: pageSize
  });
}

/**
 * Formatting of drugs within Select3 Searchbox.
 *
 * @param {ISelect3Item<IDrugData>} item The single drug id-text-target trio.
 * @param {HTMLElement} node The HTML Element in the DOM.
 * @param {"result" | "selection"} mode The search result items within the dropdown or the selected items inside the search input field.
 * @param {RegExp} currentSearchQuery The actual search query input.
 * @returns {string} The string how the drug is actually rendered.
 */
export function formatDrug(item: ISelect3Item<IDrugData>, node: HTMLElement, mode: 'result' | 'selection', currentSearchQuery?: RegExp) {
  if (mode === 'result') {
    //highlight match
    return `${item.id.replace(currentSearchQuery!, highlightMatch)}<br>
    <span class="drug-moa">Moa: ${item.data.moa ? item.data.moa.replace(currentSearchQuery!, highlightMatch) : item.data.moa}</span><br>
    <span class="drug-target">Target: ${item.data.target ? item.data.target.replace(currentSearchQuery!, highlightMatch) : item.data.target}</span>`;
  }
  return item.id;
}

/**
 * Validation of a query input via paste or filedrop against the database for Select3
 *
 * @param {string[]} query An array of drug drugids
 * @returns {Promise<Readonly<IDrugData>[]>} Return the validated drug drugids.
 */
export function validateDrug(query: string[]): Promise<Readonly<IDrugData>[]> {
  return getTDPData(drug.db, `${drug.base}_drug_items_verify/filter`, {
    column: 'drugid',
    filter_drug: query,
  });
}

/**
 * Validation of a query input via paste or filedrop against the database for Select3
 *
 * @param {string[]} query An array of gene symbols
 * @returns {Promise<Readonly<IdTextPair>[]>} Return the validated gene symbols as id-text pairs.
 */
export function validateGene(query: string[]): Promise<Readonly<IdTextPair>[]> {
  return getTDPData(gene.db, `${gene.base}_gene_items_verify/filter`, {
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
export function formatGene(item: ISelect3Item<IdTextPair>, node: HTMLElement, mode: 'result' | 'selection', currentSearchQuery?: RegExp) {
  if (mode === 'result') {
    //highlight match
    return `${item.text.replace(currentSearchQuery!, highlightMatch)} <span class="ensg">${item.id}</span>`;
  }
  return item.text;
}

// Cellline and Tissue Select3 options methods

export function search(config: IDataSourceConfig | ICommonDBConfig, query: string, page: number, pageSize: number): Promise<{ more: boolean, items: Readonly<IdTextPair>[] }> {
  return getTDPLookup(config.db, `${config.base}_items`, {
    column: config.entityName,
    species: getSelectedSpecies(),
    query,
    page,
    limit: pageSize
  });
}

export function validate(config: IDataSourceConfig | ICommonDBConfig, query: string[]): Promise<Readonly<IdTextPair>[]> {
  return getTDPData(config.db, `${config.base}_items_verify/filter`, {
    column: config.entityName,
    species: getSelectedSpecies(),
    [`filter_${config.entityName}`]: query,
  });
}

export function format(item: ISelect3Item<IdTextPair>, node: HTMLElement, mode: 'result' | 'selection', currentSearchQuery?: RegExp) {
  if (mode === 'result' && currentSearchQuery) {
    //highlight match
    return `${item.text.replace(currentSearchQuery!, highlightMatch)}`;
  }
  return item.text;
}

/**
 * Search and autocomplete of the input string for Select3
 *
 * @param {string} query An array of gene symbols
 * @param {number} page Server-side pagination page number
 * @param {number} pageSize Server-side pagination page size
 * @returns {Promise<{more: boolean; items: Readonly<IdTextPair>[]}>} Select3 conformant data structure.
 */
export function searchDrugScreen(query: string, page: number, pageSize: number): Promise<{more: boolean, items: Readonly<IdTextPair>[]}> {
  const rows= getTDPLookup(drug.db, `drug_screen_items`, {
    column: 'campaign',
    query,
    page,
    limit: pageSize
  });
  return rows;
}

/**
 * Validation of a query input via paste or filedrop against the database for Select3
 *
 * @param {string[]} query An array of drugscreen campaigns
 * @returns {Promise<Readonly<IdTextPair>[]>} Return the validated drugscreen campaigns.
 */
export function validateDrugScreen(query: string[]): Promise<Readonly<IdTextPair>[]> {
  return getTDPData(drug.db, `drug_screen_items_verify/filter`, {
    column: 'campaign',
    filter_drug_screen: query,
  });
}

/**
 * Formatting of drugsreen within Select3 Searchbox.
 *
 * @param {ISelect3Item<IdTextPair>} item The single id-text-target pair.
 * @param {HTMLElement} node The HTML Element in the DOM.
 * @param {"result" | "selection"} mode The search result items within the dropdown or the selected items inside the search input field.
 * @param {RegExp} currentSearchQuery The actual search query input.
 * @returns {string} The string how the drugscreen is actually rendered.
 */
export function formatDrugScreen(item: ISelect3Item<IdTextPair>, node: HTMLElement, mode: 'result' | 'selection', currentSearchQuery?: RegExp) {
  if (mode === 'result') {
    //highlight match
    return `${item.id.replace(currentSearchQuery!, highlightMatch)} (${item.text})`;
  }
  return item.id;
}
