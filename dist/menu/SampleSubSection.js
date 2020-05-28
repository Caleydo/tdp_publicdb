/**
 * Created by Holger Stitz on 10.08.2016.
 */
import { chooseDataSource } from '../config';
import { ACommonSubSection } from 'tdp_gene/src/menu/ACommonSubSection';
import { format, search, validate } from '../utils';
import { mixin } from 'phovea_core/src/index';
/**
 * Entry point list from all species and LineUp named sets (aka stored LineUp sessions)
 */
export class SampleSubSection extends ACommonSubSection {
    constructor(parent, desc, options) {
        super(parent, desc, chooseDataSource(desc), options);
    }
    searchOptions() {
        const base = super.searchOptions();
        return mixin(base, {
            search: (query, page, pageSize) => search(this.dataSource, query, page, pageSize),
            validate: (query) => validate(this.dataSource, query),
            format,
            tokenSeparators: /[\r\n;,]+/mg,
            defaultTokenSeparator: ';'
        });
    }
}
//# sourceMappingURL=SampleSubSection.js.map