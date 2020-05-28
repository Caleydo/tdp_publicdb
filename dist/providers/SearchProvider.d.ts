import { SearchProvider } from 'tdp_gene';
import { IResult } from 'tdp_core';
import '../scss/idtype_color.scss';
export declare function createCellline(): SearchProvider;
export declare function createTissue(): SearchProvider;
declare class GeneSearchProvider extends SearchProvider {
    get searchView(): string;
    get verifyView(): string;
    format(item: IResult, node: HTMLElement, mode: 'result' | 'selection', currentSearchQuery: string): string;
    validate(query: string[]): Promise<IResult[]>;
}
export declare function createGene(): GeneSearchProvider;
export {};
