import { gene } from '../common/config';
import { ACommonList } from './ACommonList';
import { ViewUtils } from './ViewUtils';
export class GeneList extends ACommonList {
    constructor(context, selection, parent, options) {
        super(context, selection, parent, gene, {
            enableAddingColumnGrouping: true,
            ...ViewUtils.rankingOptionsFromEnv(),
            ...options,
        });
    }
    getColumnDescs(columns) {
        return gene.columns((c) => columns.find((d) => d.column === c));
    }
}
//# sourceMappingURL=GeneList.js.map