import { gene, expression, copyNumber, mutation, chooseDataSource } from '../common/config';
import { FORM_GENE_FILTER } from '../common/forms';
import { ACombinedDependentTable } from './ACombinedDependentTable';
export class CombinedDependentGeneTable extends ACombinedDependentTable {
    constructor(context, selection, parent, dataType) {
        super(context, selection, parent, dataType);
        this.dataSource = chooseDataSource(context.desc);
    }
    get oppositeDataSource() {
        return gene;
    }
    getParameterFormDescs() {
        return super.getParameterFormDescs().concat([FORM_GENE_FILTER]);
    }
    static createCombinedDependentGeneTable(context, selection, parent) {
        return new CombinedDependentGeneTable(context, selection, parent, [copyNumber, expression, mutation]);
    }
}
//# sourceMappingURL=CombinedDependentGeneTable.js.map