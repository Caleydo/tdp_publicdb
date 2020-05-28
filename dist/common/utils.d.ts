/// <reference types="select2" />
import { ISelect3Item } from 'tdp_core';
import { IDataSourceConfig } from './config';
import { ICommonDBConfig } from 'tdp_gene';
/**
 * Search and autocomplete of the input string for Select3
 *
 * @param {string} query An array of gene symbols
 * @param {number} page Server-side pagination page number
 * @param {number} pageSize Server-side pagination page size
 * @returns {Promise<{more: boolean; items: Readonly<IdTextPair>[]}>} Select3 conformant data structure.
 */
export declare function searchGene(query: string, page: number, pageSize: number): Promise<{
    more: boolean;
    items: Readonly<IdTextPair>[];
}>;
/**
 * Validation of a query input via paste or filedrop against the database for Select3
 *
 * @param {string[]} query An array of gene symbols
 * @returns {Promise<Readonly<IdTextPair>[]>} Return the validated gene symbols as id-text pairs.
 */
export declare function validateGene(query: string[]): Promise<Readonly<IdTextPair>[]>;
/**
 * Formatting of genes within Select3 Searchbox.
 *
 * @param {ISelect3Item<IdTextPair>} item The single gene id-text pair.
 * @param {HTMLElement} node The HTML Element in the DOM.
 * @param {"result" | "selection"} mode The search result items within the dropdown or the selected items inside the search input field.
 * @param {RegExp} currentSearchQuery The actual search query input.
 * @returns {string} The string how the gene is actually rendered.
 */
export declare function formatGene(item: ISelect3Item<IdTextPair>, node: HTMLElement, mode: 'result' | 'selection', currentSearchQuery?: RegExp): string;
export declare function search(config: IDataSourceConfig | ICommonDBConfig, query: string, page: number, pageSize: number): Promise<{
    more: boolean;
    items: Readonly<IdTextPair>[];
}>;
export declare function validate(config: IDataSourceConfig | ICommonDBConfig, query: string[]): Promise<Readonly<IdTextPair>[]>;
export declare function format(item: ISelect3Item<IdTextPair>, node: HTMLElement, mode: 'result' | 'selection', currentSearchQuery?: RegExp): string;
