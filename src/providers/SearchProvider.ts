import {SearchProvider} from 'tdp_gene';
import {IResult} from 'tdp_core';
import {cellline, gene, tissue} from '../common/config';
import {SpeciesUtils} from 'tdp_gene';
import {RestBaseUtils} from 'tdp_core';



export class GeneSearchProvider extends SearchProvider {
  get searchView() {
    return `${this.dataSource.base}_gene_items`;
  }

  get verifyView() {
    return `${this.dataSource.base}_gene_items_verify`;
  }

  format(item: IResult, node: HTMLElement, mode: 'result'|'selection', currentSearchQuery: string): string {
    return (item.id && mode === 'result') ? `${item.text || ''} <span class="ensg">${item.id}</span>` : item.text;
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
