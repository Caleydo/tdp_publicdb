import { IResult } from 'tdp_core';
import { SearchProvider } from './SearchProvider';
export declare class GeneSearchProvider extends SearchProvider {
    get searchView(): string;
    get verifyView(): string;
    validate(query: string[]): Promise<IResult[]>;
    static createCellline(): SearchProvider;
    static createTissue(): SearchProvider;
    static createGene(): GeneSearchProvider;
}
//# sourceMappingURL=GeneSearchProvider.d.ts.map