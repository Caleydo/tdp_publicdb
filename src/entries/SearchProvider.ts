import SearchProvider, {IResult} from 'targid_common/src/entries/SearchProvider';
import {cellline, gene, tissue} from '../config';
import '../styles/idtype_color.scss';
import {getAPIJSON} from 'phovea_core/src/ajax';
import {getSelectedSpecies} from 'targid_common/src/Common';

export function createCellline() {
  return new SearchProvider(cellline);
}

export function createTissue() {
  return new SearchProvider(tissue);
}

class GeneSearchProvider extends SearchProvider {
  get searchUrl() {
    return `/targid/db/${this.dataSource.db}/${this.dataSource.base}_gene_items/lookup`;
  }

  get verifyUrl() {
    return `/targid/db/${this.dataSource.db}/${this.dataSource.base}_gene_items_verify/filter`;
  }

  format?(item: IResult): string {
    return (item.id) ? `${item.text || ''} <span class="ensg">${(<any>item).extra}</span>` : item.text;
  }

  validate(query: string[]): Promise<IResult[]> {
    return getAPIJSON(this.verifyUrl, {
      cspecies: getSelectedSpecies(),
      [`filter_symbol`]: query,
    }).then((data) => data.map(this.mapItems.bind(this)));
  }
}

export function createGene() {
  return new GeneSearchProvider(gene);
}
