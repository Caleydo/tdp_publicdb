import { SearchProvider } from 'tdp_gene';
import { cellline, gene, tissue } from '../common/config';
import '../scss/idtype_color.scss';
import { SpeciesUtils } from 'tdp_gene';
import { RestBaseUtils } from 'tdp_core';
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
        return RestBaseUtils.getTDPData(this.dataSource.db, `${this.verifyView}/filter`, {
            species: SpeciesUtils.getSelectedSpecies(),
            filter_symbol: query,
        }).then((data) => data.map(SearchProvider.mapItems));
    }
}
export function createGene() {
    return new GeneSearchProvider(gene);
}
//# sourceMappingURL=SearchProvider.js.map