import { tissue } from '../common/config';
import { ACommonList } from './ACommonList';
import { ViewUtils } from './ViewUtils';
export class TissueList extends ACommonList {
    constructor(context, selection, parent, options) {
        super(context, selection, parent, tissue, {
            enableAddingColumnGrouping: true,
            ...ViewUtils.rankingOptionsFromEnv(),
            ...options,
        });
    }
    getColumnDescs(columns) {
        return tissue.columns((c) => columns.find((d) => d.column === c));
    }
}
//# sourceMappingURL=TissueList.js.map