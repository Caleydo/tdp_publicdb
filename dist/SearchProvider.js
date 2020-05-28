import { SearchProvider } from 'tdp_gene/src/SearchProvider';
import { cellline, gene, tissue } from './config';
import './styles/idtype_color.scss';
import { getSelectedSpecies } from 'tdp_gene/src/common';
import { getTDPData } from 'tdp_core/src/rest';
export function createCellline() {
    return new SearchProvider(cellline);
}
export function createTissue() {
    return new SearchProvider(tissue);
}
class GeneSearchProvider extends SearchProvider {
    get searchView() {
        return `${this.dataSource.base}_gene_items`;
    }
    get verifyView() {
        return `${this.dataSource.base}_gene_items_verify`;
    }
    format(item, node, mode, currentSearchQuery) {
        return (item.id && mode === 'result') ? `${item.text || ''} <span class="ensg">${item.id}</span>` : item.text;
    }
    validate(query) {
        return getTDPData(this.dataSource.db, `${this.verifyView}/filter`, {
            species: getSelectedSpecies(),
            filter_symbol: query,
        }).then((data) => data.map(SearchProvider.mapItems));
    }
}
export function createGene() {
    return new GeneSearchProvider(gene);
}
//# sourceMappingURL=SearchProvider.js.map