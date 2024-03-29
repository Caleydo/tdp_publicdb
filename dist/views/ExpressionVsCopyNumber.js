import { IDTypeManager } from 'visyn_core/idtype';
import { LineupUtils, RestBaseUtils } from 'tdp_core';
import { ViewUtils } from './ViewUtils';
import { ParameterFormIds, FORM_TISSUE_OR_CELLLINE_FILTER, FORM_DATA_SOURCE, FORM_COLOR_CODING } from '../common/forms';
import { expression, copyNumber } from '../common/config';
import { AExpressionVsCopyNumber } from './AExpressionVsCopyNumber';
import { SpeciesUtils } from '../common';
export class ExpressionVsCopyNumber extends AExpressionVsCopyNumber {
    getParameterFormDescs() {
        const base = super.getParameterFormDescs();
        base.unshift(FORM_DATA_SOURCE);
        base.push(FORM_COLOR_CODING);
        base.push(FORM_TISSUE_OR_CELLLINE_FILTER);
        return base;
    }
    get dataSource() {
        return this.getParameterData(ParameterFormIds.DATA_SOURCE);
    }
    loadFirstName(ensg) {
        return ViewUtils.loadFirstName(ensg);
    }
    loadData(ensg) {
        const ds = this.dataSource;
        const param = {
            ensg,
            expression_subtype: this.getParameterData(ParameterFormIds.EXPRESSION_SUBTYPE).id,
            copynumber_subtype: this.getParameterData(ParameterFormIds.COPYNUMBER_SUBTYPE).id,
            species: SpeciesUtils.getSelectedSpecies(),
        };
        const color = this.getParameterData(ParameterFormIds.COLOR_CODING);
        if (color) {
            param.color = color;
        }
        return RestBaseUtils.getTDPData(ds.db, `${ds.base}_expression_vs_copynumber${!color ? '_plain' : ''}/filter`, RestBaseUtils.mergeParamAndFilters(param, LineupUtils.toFilter(this.getParameter('filter'))));
    }
    getExpressionValues() {
        return expression.dataSubtypes.map((ds) => {
            return { name: ds.name, value: ds.id, data: ds };
        });
    }
    getCopyNumberValues() {
        return copyNumber.dataSubtypes.map((ds) => {
            return { name: ds.name, value: ds.id, data: ds };
        });
    }
    get itemIDType() {
        return IDTypeManager.getInstance().resolveIdType(this.dataSource.idType);
    }
    select(ids) {
        this.setItemSelection({
            idtype: this.itemIDType,
            ids,
        });
    }
}
//# sourceMappingURL=ExpressionVsCopyNumber.js.map