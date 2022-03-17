import { SearchProvider, SpeciesUtils } from 'tdp_gene';
import { IResult, RestBaseUtils } from 'tdp_core';
import { cellline, gene, tissue } from '../common/config';

export class GeneSearchProvider extends SearchProvider {
  get searchView() {
    return `${this.dataSource.base}_gene_items`;
  }

  get verifyView() {
    return `${this.dataSource.base}_gene_items_verify`;
  }

  validate(query: string[]): Promise<IResult[]> {
    return RestBaseUtils.getTDPData(this.dataSource.db, `${this.verifyView}/filter`, {
      species: SpeciesUtils.getSelectedSpecies(),
      filter_symbol: query,
    }).then((data) => data.map(SearchProvider.mapItems));
  }

  static createCellline() {
    return new SearchProvider(cellline);
  }

  static createTissue() {
    return new SearchProvider(tissue);
  }

  static createGene() {
    return new GeneSearchProvider(gene);
  }
}
