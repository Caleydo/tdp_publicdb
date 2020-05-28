/**
 * Created by sam on 06.03.2017.
 */
import { gene, tissue, cellline, MAX_FILTER_SCORE_ROWS_BEFORE_ALL, splitTypes } from '../common/config';
import { FormElementType } from 'tdp_core';
import { ParameterFormIds, FORM_GENE_NAME, FORM_TISSUE_NAME, FORM_CELLLINE_NAME } from '../common/forms';
import { FORCE_COMPUTE_ALL_CELLLINE, FORCE_COMPUTE_ALL_GENES, FORCE_COMPUTE_ALL_TISSUE, FORM_SINGLE_SCORE, FORM_SINGLE_SCORE_DEPLETION } from './forms';
import { selectDataSources } from './utils';
import { BaseUtils } from 'phovea_core';
import { FormDialog } from 'tdp_core';
import { ASingleScore } from './ASingleScore';
function enableMultiple(desc) {
    return BaseUtils.mixin({}, desc, {
        type: FormElementType.SELECT3_MULTIPLE,
        useSession: false
    });
}
class SingleScore extends ASingleScore {
    constructor(parameter, dataSource, oppositeDataSource) {
        super(parameter, dataSource, oppositeDataSource);
    }
    getViewPrefix() {
        return '';
    }
}
class SingleDepletionScore extends ASingleScore {
    constructor(parameter, dataSource, oppositeDataSource) {
        super(parameter, dataSource, oppositeDataSource);
    }
    getViewPrefix() {
        return 'depletion_';
    }
    createFilter() {
        return {
            depletionscreen: this.dataSubType.id === 'ceres' ? 'Avana' : 'Drive'
        };
    }
}
export function createScoreDialog(pluginDesc, extra, formDesc, countHint) {
    const { primary, opposite } = selectDataSources(pluginDesc);
    const dialog = new FormDialog('Add Single Score Column', 'Add Single Score Column');
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
    }
    if (typeof countHint === 'number' && countHint > MAX_FILTER_SCORE_ROWS_BEFORE_ALL) {
        formDesc.pop();
    }
    dialog.append(...formDesc);
    return dialog.showAsPromise((form) => {
        const data = form.getElementData();
        {
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
        }
        return data;
    });
}
export function initializeScore(data, pluginDesc, singleScoreFactory) {
    const { primary, opposite } = selectDataSources(pluginDesc);
    const configs = data.data_types;
    function defineScore(name) {
        if (configs) {
            return configs.map((ds) => singleScoreFactory({ name, data_type: ds[0], data_subtype: ds[1], maxDirectFilterRows: data.maxDirectFilterRows }, primary, opposite));
        }
        else {
            return singleScoreFactory(Object.assign({}, data, { name }), primary, opposite);
        }
    }
    if (Array.isArray(data.name)) {
        return [].concat(...data.name.map((name) => defineScore(name)));
    }
    else {
        return defineScore(data.name);
    }
}
export function create(pluginDesc, extra, countHint) {
    return createScoreDialog(pluginDesc, extra, FORM_SINGLE_SCORE.slice(), countHint);
}
export function createScore(data, pluginDesc) {
    return initializeScore(data, pluginDesc, (parameter, dataSource, oppositeDataSource) => new SingleScore(parameter, dataSource, oppositeDataSource));
}
// Factories for depletion scores for DRIVE data
export function createSingleDepletionScoreDialog(pluginDesc, extra, countHint) {
    return createScoreDialog(pluginDesc, extra, FORM_SINGLE_SCORE_DEPLETION.slice(), countHint);
}
export function createSingleDepletionScore(data, pluginDesc) {
    return initializeScore(data, pluginDesc, (parameter, dataSource, oppositeDataSource) => new SingleDepletionScore(parameter, dataSource, oppositeDataSource));
}
//# sourceMappingURL=SingleScore.js.map