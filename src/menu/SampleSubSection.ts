/**
 * Created by Holger Stitz on 10.08.2016.
 */

import {chooseDataSource} from '../config';
import {ACommonSubSection} from 'tdp_gene/src/menu/ACommonSubSection';
import {IStartMenuSubSectionDesc} from 'tdp_gene/src/extensions';
import {IStartMenuSectionOptions} from 'ordino/src/extensions';
import {format, search, validate} from '../utils';
import {mixin} from 'phovea_core/src/index';

/**
 * Entry point list from all species and LineUp named sets (aka stored LineUp sessions)
 */
export default class SampleSubSection extends ACommonSubSection {
  constructor(parent: HTMLElement, desc: IStartMenuSubSectionDesc, options: IStartMenuSectionOptions) {
    super(parent, desc, chooseDataSource(desc), options);
  }

  protected searchOptions() {
    const base = super.searchOptions();
    return mixin(base, {
      search: (query, page, pageSize) => search(this.dataSource, query, page, pageSize),
      validate: (query) => validate(this.dataSource, query),
      format,
      tokenSeparators: /[;,]+/mg
    });
  }
}
