/**
 * Created by sam on 06.03.2017.
 */
import { gene, tissue, cellline, MAX_FILTER_SCORE_ROWS_BEFORE_ALL, splitTypes, drug } from '../common/config';
import { FormElementType } from 'tdp_core';
import { ParameterFormIds, FORM_GENE_NAME, FORM_TISSUE_NAME, FORM_CELLLINE_NAME, FORM_DRUG_NAME } from '../common/forms';
import { I18nextManager } from 'phovea_core';
import { FORCE_COMPUTE_ALL_CELLLINE, FORCE_COMPUTE_ALL_GENES, FORCE_COMPUTE_ALL_TISSUE, FORM_SINGLE_SCORE, FORM_SINGLE_SCORE_DEPLETION, FORM_SINGLE_SCORE_DRUG } from './forms';
import { ScoreUtils } from './ScoreUtils';
import { BaseUtils } from 'phovea_core';
import { FormDialog } from 'tdp_core';
function enableMultiple(desc) {
    return BaseUtils.mixin({}, desc, {
        type: FormElementType.SELECT3_MULTIPLE,
        useSession: false
    });
}
export class SingleScoreDialog {
    static createScoreDialog(pluginDesc, extra, formDesc, countHint) {
        const { primary, opposite } = ScoreUtils.selectDataSources(pluginDesc);
        const dialog = new FormDialog(I18nextManager.getInstance().i18n.t('tdp:publicdb.addSingle'), I18nextManager.getInstance().i18n.t('tdp:publicdb.add'), `form-dialog-${pluginDesc.id}`);
        switch (opposite) {
            case gene:
                formDesc.unshift(enableMultiple(FORM_GENE_NAME));
                formDesc.push(primary === tissue ? FORCE_COMPUTE_ALL_TISSUE : FORCE_COMPUTE_ALL_CELLLINE);
                break;
            case tissue:
                formDesc.unshift(enableMultiple(FORM_TISSUE_NAME));
                formDesc.push(FORCE_COMPUTE_ALL_GENES);
                break;
            case cellline:
                formDesc.unshift(enableMultiple(FORM_CELLLINE_NAME));
                formDesc.push(FORCE_COMPUTE_ALL_GENES);
                break;
            case drug:
                formDesc.splice(1, 0, enableMultiple(FORM_DRUG_NAME));
                formDesc.push(FORCE_COMPUTE_ALL_CELLLINE);
                break;
        }
        if (typeof countHint === 'number' && countHint > MAX_FILTER_SCORE_ROWS_BEFORE_ALL) {
            formDesc.pop();
        }
        dialog.append(...formDesc);
        return dialog.showAsPromise((form) => {
            const data = form.getElementData();
            {
                const screenType = data[ParameterFormIds.SCREEN_TYPE];
                if (screenType) {
                    delete data[ParameterFormIds.SCREEN_TYPE];
                    data.screen_type = screenType.id;
                }
                const datatypes = data[ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE];
                delete data[ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE];
                const resolved = datatypes.map((entry) => {
                    const { dataType, dataSubType } = splitTypes(entry.id);
                    return [dataType.id, dataSubType.id];
                });
                if (datatypes.length === 1) {
                    data.data_type = resolved[0][0];
                    data.data_subtype = resolved[0][1];
                }
                else {
                    data.data_types = resolved;
                }
            }
            switch (opposite) {
                case gene:
                    data.name = data[ParameterFormIds.GENE_SYMBOL];
                    delete data[ParameterFormIds.GENE_SYMBOL];
                    break;
                case tissue:
                    data.name = data[ParameterFormIds.TISSUE_NAME];
                    delete data[ParameterFormIds.TISSUE_NAME];
                    break;
                case cellline:
                    data.name = data[ParameterFormIds.CELLLINE_NAME];
                    delete data[ParameterFormIds.CELLLINE_NAME];
                    break;
                case drug:
                    data.name = data[ParameterFormIds.DRUG_NAME];
                    delete data[ParameterFormIds.DRUG_NAME];
                    break;
            }
            return data;
        });
    }
    static create(pluginDesc, extra, countHint) {
        return SingleScoreDialog.createScoreDialog(pluginDesc, extra, FORM_SINGLE_SCORE.slice(), countHint);
    }
    // Factories for depletion scores for DRIVE data
    static createSingleDepletionScoreDialog(pluginDesc, extra, countHint) {
        return SingleScoreDialog.createScoreDialog(pluginDesc, extra, FORM_SINGLE_SCORE_DEPLETION.slice(), countHint);
    }
    static createSingleDrugScoreDialog(pluginDesc, extra, countHint) {
        return SingleScoreDialog.createScoreDialog(pluginDesc, extra, FORM_SINGLE_SCORE_DRUG.slice(), countHint);
    }
}
//# sourceMappingURL=SingleScoreDialog.js.map