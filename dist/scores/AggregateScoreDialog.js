/**
 * Created by Samuel Gratzl on 27.04.2016.
 */
import { I18nextManager } from 'tdp_core';
import { ParameterFormIds, FORM_GENE_FILTER, FORM_TISSUE_FILTER, FORM_CELLLINE_FILTER } from '../common/forms';
import { FORCE_COMPUTE_ALL_CELLLINE, FORCE_COMPUTE_ALL_GENES, FORCE_COMPUTE_ALL_TISSUE, FORM_AGGREGATED_SCORE, FORM_AGGREGATED_SCORE_DEPLETION } from './forms';
import { gene, tissue, cellline, splitTypes, MAX_FILTER_SCORE_ROWS_BEFORE_ALL } from '../common/config';
import { ScoreUtils } from './ScoreUtils';
import { FormDialog } from 'tdp_core';
import { FormMap } from 'tdp_core';
export class AggregateScoreDialog {
    static createScoreDialog(pluginDesc, extras, formDesc, countHint) {
        const { primary, opposite } = ScoreUtils.selectDataSources(pluginDesc);
        const dialog = new FormDialog(I18nextManager.getInstance().i18n.t('tdp:publicdb.addAggregated'), I18nextManager.getInstance().i18n.t('tdp:publicdb.add'));
        switch (opposite) {
            case gene:
                formDesc.unshift(FORM_GENE_FILTER);
                formDesc.push(primary === tissue ? FORCE_COMPUTE_ALL_TISSUE : FORCE_COMPUTE_ALL_CELLLINE);
                break;
            case tissue:
                formDesc.unshift(FORM_TISSUE_FILTER);
                formDesc.push(FORCE_COMPUTE_ALL_GENES);
                break;
            case cellline:
                formDesc.unshift(FORM_CELLLINE_FILTER);
                formDesc.push(FORCE_COMPUTE_ALL_GENES);
                break;
        }
        if (typeof countHint === 'number' && countHint > MAX_FILTER_SCORE_ROWS_BEFORE_ALL) {
            formDesc.pop();
        }
        dialog.append(...formDesc);
        return dialog.showAsPromise((form) => {
            const data = form.getElementData();
            if (AggregateScoreDialog.showSizeWarning(dialog.body.parentElement, data, typeof countHint === 'number' ? countHint : -1)) {
                return null;
            }
            const { dataType, dataSubType } = splitTypes(data[ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE].id);
            delete data[ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE];
            data.data_type = dataType.id;
            data.data_subtype = dataSubType.id;
            if (dataSubType.id === 'copynumberclass') {
                // cornercase in case of copynumber class we have an in :class list case
                data.comparison_value = `${(data.comparison_cn || []).map((d) => d.id).join(',')}`;
            }
            else {
                delete data.comparison_cn;
            }
            data.filter = FormMap.convertRow2MultiMap(data.filter);
            return data;
        });
    }
    /**
     * hacky way to integrate a warning sign if the raw matrix is too big
     */
    static showSizeWarning(dialog, data, countHint = -1) {
        const footer = dialog.querySelector('.modal-footer');
        if (!footer.querySelector('div.alert')) {
            footer.insertAdjacentHTML('afterbegin', `<div class="alert alert-warning" style="text-align: left" data-size="0">Confirm loading</div>`);
        }
        const alert = footer.querySelector('div.alert');
        alert.style.display = 'none';
        if (data[ParameterFormIds.AGGREGATION] !== 'numbers') {
            return false;
        }
        // try to find out how many columns we are dealing with
        const columns = parseInt(dialog.querySelector('span.badge').innerText, 10);
        if (!columns || isNaN(columns)) {
            return false;
        }
        if (columns <= 8) {
            return false; //small
        }
        // show
        alert.style.display = null;
        if (parseInt(alert.dataset.size, 10) === columns) {
            return false; // already showing the alert with the same size -> user confirmed it
        }
        alert.dataset.size = String(columns);
        alert.innerHTML = `Note that this query might take very long.s
    Loading ${columns} values per row for ${countHint > 0 ? countHint : 'e.g. 1000'} rows results in ${columns * (countHint > 0 ? countHint : 1000)} values that need to be transferred from the database.
    Confirm that you want to run this query by pressing the button.`;
        return true;
    }
    static create(pluginDesc, extras, countHint) {
        return AggregateScoreDialog.createScoreDialog(pluginDesc, extras, FORM_AGGREGATED_SCORE.slice(), countHint);
    }
    static createAggregatedDepletionScoreDialog(pluginDesc, extras, countHint) {
        return AggregateScoreDialog.createScoreDialog(pluginDesc, extras, FORM_AGGREGATED_SCORE_DEPLETION.slice(), countHint);
    }
}
//# sourceMappingURL=AggregateScoreDialog.js.map