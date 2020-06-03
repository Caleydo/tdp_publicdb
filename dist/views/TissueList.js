import { ACommonList } from 'tdp_gene';
import { tissue } from '../common/config';
export class TissueList extends ACommonList {
    constructor(context, selection, parent, options) {
        super(context, selection, parent, tissue, Object.assign({
            enableAddingColumnGrouping: true
        }, options));
    }
    getColumnDescs(columns) {
        return tissue.columns((c) => columns.find((d) => d.column === c));
    }
}
//# sourceMappingURL=TissueList.js.map