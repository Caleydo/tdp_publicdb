/**
 * Created by Holger Stitz on 10.08.2016.
 */
import { chooseDataSource } from '../common/config';
import { ACommonSubSection } from 'tdp_gene';
import { GeneUtils } from '../common/GeneUtils';
import { BaseUtils } from 'phovea_core';
/**
 * Entry point list from all species and LineUp named sets (aka stored LineUp sessions)
 */
export class SampleSubSection extends ACommonSubSection {
    constructor(parent, desc, options) {
        super(parent, desc, chooseDataSource(desc), options);
    }
    searchOptions() {
        const base = super.searchOptions();
        return BaseUtils.mixin(base, {
            search: (query, page, pageSize) => GeneUtils.search(this.dataSource, query, page, pageSize),
            validate: (query) => GeneUtils.validate(this.dataSource, query),
            format: GeneUtils.format,
            tokenSeparators: /[\r\n;,]+/mg,
            defaultTokenSeparator: ';'
        });
    }
}
//# sourceMappingURL=SampleSubSection.js.map