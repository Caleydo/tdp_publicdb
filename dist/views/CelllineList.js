import { ACommonList } from 'tdp_gene/src/views/ACommonList';
import { cellline } from '../config';
export class CelllineList extends ACommonList {
    constructor(context, selection, parent, options) {
        super(context, selection, parent, cellline, Object.assign({
            enableAddingColumnGrouping: true
        }, options));
    }
    getColumnDescs(columns) {
        return cellline.columns((c) => columns.find((d) => d.column === c));
    }
}
//# sourceMappingURL=CelllineList.js.map