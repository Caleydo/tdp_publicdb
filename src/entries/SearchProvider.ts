import SearchProvider, {IResult} from 'targid_common/src/entries/SearchProvider';
import {cellline, gene, tissue} from '../config';

export function createCellline() {
  return new SearchProvider(cellline);
}

export function createTissue() {
  return new SearchProvider(tissue);
}

class GeneSearchProvider extends SearchProvider {
  format?(item: IResult): string {
    return (item.id) ? `${item.text || ''} <span class="ensg">${(<any>item).extra}</span>` : item.text;
  }
}

export function createGene() {
  return new GeneSearchProvider(gene);
}
