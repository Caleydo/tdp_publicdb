import { ACommonList } from 'tdp_gene';
import { cellline } from '../common/config';
export class CelllineList extends ACommonList {
    constructor(context, selection, parent, options) {
        super(context, selection, parent, cellline, {
            enableAddingColumnGrouping: true,
            ...options,
        });
    }
    getColumnDescs(columns) {
        return cellline.columns((c) => columns.find((d) => d.column === c));
    }
}
//# sourceMappingURL=CelllineList.js.map