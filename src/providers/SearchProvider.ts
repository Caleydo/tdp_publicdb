// redeclare to avoid dependency
import { IResult, ISearchProvider } from 'tdp_core';
import { RestBaseUtils } from 'tdp_core';
import { SpeciesUtils } from '../common/common';

export class SearchProvider implements ISearchProvider {
  constructor(protected readonly dataSource: { db: string; base: string; entityName: string }) {}

  get searchView() {
    return `${this.dataSource.base}_items`;
  }

  get verifyView() {
    return `${this.dataSource.base}_items_verify`;
  }

  protected static mapItems(result: any): IResult {
    return result;
  }

  search(query: string, page: number, pageSize: number) {
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

  validate(query: string[]): Promise<IResult[]> {
    return RestBaseUtils.getTDPData(this.dataSource.db, `${this.verifyView}/filter`, {
      column: this.dataSource.entityName,
      species: SpeciesUtils.getSelectedSpecies(),
      [`filter_${this.dataSource.entityName}`]: query,
    }).then((data) => data.map(SearchProvider.mapItems));
  }
}
