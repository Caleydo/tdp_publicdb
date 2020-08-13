import { gene, expression, copyNumber, mutation, } from '../common/config';
import { ParameterFormIds, FORM_DATA_SOURCE, FORM_TISSUE_OR_CELLLINE_FILTER } from '../common/forms';
import { ACombinedDependentTable } from './ACombinedDependentTable';
import { ViewUtils } from './ViewUtils';
export class CombinedDependentSampleTable extends ACombinedDependentTable {
    constructor(context, selection, parent, dataType) {
        super(context, selection, parent, dataType);
        this.dataSource = gene;
    }
    get oppositeDataSource() {
        return this.getParameterData(ParameterFormIds.DATA_SOURCE);
    }
    getParameterFormDescs() {
        const base = super.getParameterFormDescs();
        base.unshift(FORM_DATA_SOURCE);
        base.push(FORM_TISSUE_OR_CELLLINE_FILTER);
        return base;
    }
    parameterChanged(name) {
        if (name === FORM_DATA_SOURCE.id) {
            this.rebuild();
            return; // early abort since there is nothing worse than building from scratch
        }
        super.parameterChanged(name);
    }
    getSelectionColumnLabel(ensg) {
        return ViewUtils.loadFirstName(ensg);
    }
    static createCombinedDependentSampleTable(context, selection, parent) {
        return new CombinedDependentSampleTable(context, selection, parent, [copyNumber, expression, mutation]);
    }
}
//# sourceMappingURL=CombinedDependentSampleTable.js.map