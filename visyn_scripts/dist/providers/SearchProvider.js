import { RestBaseUtils } from 'tdp_core';
import { SpeciesUtils } from '../common/common';
export class SearchProvider {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    get searchView() {
        return `${this.dataSource.base}_items`;
    }
    get verifyView() {
        return `${this.dataSource.base}_items_verify`;
    }
    static mapItems(result) {
        return result;
    }
    search(query, page, pageSize) {
        return RestBaseUtils.getTDPLookup(this.dataSource.db, this.searchView, {
            column: this.dataSource.entityName,
            species: SpeciesUtils.getSelectedSpecies(),
            query,
            page,
            limit: pageSize,
        }).then((data) => {
            return {
                items: data.items.map(SearchProvider.mapItems),
                more: data.more,
            };
        });
    }
    validate(query) {
        return RestBaseUtils.getTDPData(this.dataSource.db, `${this.verifyView}/filter`, {
            column: this.dataSource.entityName,
            species: SpeciesUtils.getSelectedSpecies(),
            [`filter_${this.dataSource.entityName}`]: query,
        }).then((data) => data.map(SearchProvider.mapItems));
    }
}
//# sourceMappingURL=SearchProvider.js.map