import { ACommonList } from 'tdp_gene';
import { gene } from '../common/config';
export class GeneList extends ACommonList {
    constructor(context, selection, parent, options) {
        super(context, selection, parent, gene, {
            enableAddingColumnGrouping: true,
            ...options,
        });
    }
    getColumnDescs(columns) {
        return gene.columns((c) => columns.find((d) => d.column === c));
    }
}
//# sourceMappingURL=GeneList.js.map