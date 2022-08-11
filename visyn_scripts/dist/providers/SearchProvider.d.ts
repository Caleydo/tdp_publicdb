import { SearchProvider } from 'tdp_gene';
import { IResult } from 'tdp_core';
export declare class GeneSearchProvider extends SearchProvider {
    get searchView(): string;
    get verifyView(): string;
    validate(query: string[]): Promise<IResult[]>;
    static createCellline(): SearchProvider;
    static createTissue(): SearchProvider;
    static createGene(): GeneSearchProvider;
}
//# sourceMappingURL=SearchProvider.d.ts.map