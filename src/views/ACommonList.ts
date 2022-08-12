/**
 * Created by sam on 06.03.2017.
 */

import { AStartList, IAStartListOptions, ISelection, IViewContext, RestBaseUtils, IParams } from 'tdp_core';
import { SpeciesUtils, Species } from '../common/common';

export interface ICommonDBConfig {
  idType: string;
  name: string;
  db: string;
  base: string;
  entityName: string;
  tableName: string;
}

export interface IACommonListOptions extends IAStartListOptions {
  search?: ISearchResult;
}

interface ISearchResult {
  ids: string[];
  type: string;
}

export abstract class ACommonList extends AStartList {
  private search: ISearchResult;

  constructor(
    context: IViewContext,
    selection: ISelection,
    parent: HTMLElement,
    protected readonly dataSource: ICommonDBConfig,
    options: Partial<IACommonListOptions>,
  ) {
    super(context, selection, parent, {
      additionalScoreParameter: dataSource,
      itemName: dataSource.name,
      itemIDType: dataSource.idType,
      subType: {
        key: Species.SPECIES_SESSION_KEY,
        value: SpeciesUtils.getSelectedSpecies(),
      },
      panelAddColumnBtnOptions: {
        btnClass: 'btn-primary',
      },
      ...options,
    });

    if (!this.namedSet && options) {
      this.search = options.search;
    }
  }

  protected loadColumnDesc() {
    return RestBaseUtils.getTDPDesc(this.dataSource.db, this.dataSource.base);
  }

  protected buildFilter(): IParams {
    const filter: IParams = {
      [Species.SPECIES_SESSION_KEY]: SpeciesUtils.getSelectedSpecies(),
    };

    Object.assign(
      filter,
      this.buildNamedSetFilters(`namedset4${(<any>this.dataSource).namedSetEntityName || this.dataSource.entityName}`, (key) => this.isValidFilter(key)),
    );
    if (this.search) {
      filter[this.dataSource.entityName] = this.search.ids;
    }

    return filter;
  }

  protected loadRows() {
    return RestBaseUtils.getTDPFilteredRows(this.dataSource.db, this.dataSource.base, {}, this.buildFilter());
  }

  protected isValidFilter(key: string) {
    return key !== '';
  }
}
