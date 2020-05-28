import { ParameterFormIds, CATEGORICAL_AGGREGATION, NUMERIC_AGGREGATION, COMPARISON_OPERATORS, FORM_DATA_HIERARCHICAL_SUBTYPE, FORM_DATA_HIERARCHICAL_SUBTYPE_AGGREGATED_SELECTION, FORM_DATA_HIERARCHICAL_SUBTYPE_DEPLETION, FORM_DATA_HIERARCHICAL_SUBTYPE_AGGREGATED_SELECTION_DEPLETION } from '../forms';
import { FormElementType } from 'tdp_core/src/form';
import { MAX_FILTER_SCORE_ROWS_BEFORE_ALL, splitTypes, dataSubtypes } from '../config';
import { copyNumberCat, unknownCopyNumberValue } from 'tdp_gene/src/constants';
/**
 * Created by Samuel Gratzl on 15.03.2017.
 */
const COMMON_AGGREGATED_SCORE_FORM_ELEMENTS = [
    {
        type: FormElementType.SELECT,
        label: 'Aggregation',
        id: ParameterFormIds.AGGREGATION,
        dependsOn: [ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE],
        required: true,
        options: {
            optionsData: (selection) => {
                if (selection.length === 0 || selection[0].id === '') {
                    return NUMERIC_AGGREGATION;
                }
                const { dataSubType } = splitTypes(selection[0].id);
                if (dataSubType.type === dataSubtypes.cat) {
                    return CATEGORICAL_AGGREGATION;
                }
                else {
                    return NUMERIC_AGGREGATION;
                }
            }
        },
        useSession: true
    },
    {
        type: FormElementType.SELECT,
        label: 'Comparison Operator',
        id: ParameterFormIds.COMPARISON_OPERATOR,
        dependsOn: [ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE, ParameterFormIds.AGGREGATION],
        required: true,
        showIf: (dependantValues) => {
            if (dependantValues[0].id === '') {
                return false;
            }
            const agg = dependantValues[1] ? dependantValues[1].value : null;
            const { dataSubType } = splitTypes(dependantValues[0].id);
            return (agg === 'frequency' || agg === 'count') && dataSubType.type === dataSubtypes.number;
        },
        options: {
            optionsData: COMPARISON_OPERATORS
        },
        useSession: true
    },
    {
        type: FormElementType.INPUT_TEXT,
        label: 'Comparison Value',
        id: ParameterFormIds.COMPARISON_VALUE,
        required: true,
        dependsOn: [ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE, ParameterFormIds.AGGREGATION],
        showIf: (dependantValues) => {
            if (dependantValues[0].id === '') {
                return false;
            }
            const agg = dependantValues[1] ? dependantValues[1].value : null;
            const { dataSubType } = splitTypes(dependantValues[0].id);
            return (agg === 'frequency' || agg === 'count') && dataSubType.type === dataSubtypes.number;
        },
        useSession: true,
        options: {
            type: 'number',
            step: 'any'
        }
    }
];
export const FORM_AGGREGATED_SCORE = [
    FORM_DATA_HIERARCHICAL_SUBTYPE_AGGREGATED_SELECTION,
    ...COMMON_AGGREGATED_SCORE_FORM_ELEMENTS,
    {
        type: FormElementType.SELECT2_MULTIPLE,
        label: 'Copy Number Class is',
        id: ParameterFormIds.COMPARISON_CN,
        attributes: {
            style: 'width:100%'
        },
        required: true,
        dependsOn: [ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE, ParameterFormIds.AGGREGATION],
        showIf: (dependantValues) => {
            if (dependantValues[0].id === '') {
                return false;
            }
            const agg = dependantValues[1].value;
            const { dataSubType } = splitTypes(dependantValues[0].id);
            return (agg === 'frequency' || agg === 'count') && dataSubType.id === 'copynumberclass';
        },
        useSession: true,
        options: {
            data: copyNumberCat.filter((d) => d.value !== unknownCopyNumberValue).map((d) => ({ text: d.name, id: String(d.value) }))
        }
    }
];
const FORM_COMPUTE_BASE = {
    type: FormElementType.CHECKBOX,
    id: ParameterFormIds.SCORE_FORCE_DATASET_SIZE,
    options: {
        checked: MAX_FILTER_SCORE_ROWS_BEFORE_ALL,
        unchecked: -1
    },
    useSession: true
};
export const FORCE_COMPUTE_ALL_GENES = Object.assign({
    label: 'Compute only for selected subset of genes and not for all'
}, FORM_COMPUTE_BASE);
export const FORCE_COMPUTE_ALL_TISSUE = Object.assign({
    label: 'Compute only for selected subset of tissues and not for all'
}, FORM_COMPUTE_BASE);
export const FORCE_COMPUTE_ALL_CELLLINE = Object.assign({
    label: 'Compute only for selected subset of cell lines and not for all'
}, FORM_COMPUTE_BASE);
export const FORM_SINGLE_SCORE = [
    FORM_DATA_HIERARCHICAL_SUBTYPE
];
export const FORM_AGGREGATED_SCORE_DEPLETION = [
    FORM_DATA_HIERARCHICAL_SUBTYPE_AGGREGATED_SELECTION_DEPLETION,
    ...COMMON_AGGREGATED_SCORE_FORM_ELEMENTS
];
export const FORM_SINGLE_SCORE_DEPLETION = [
    FORM_DATA_HIERARCHICAL_SUBTYPE_DEPLETION
];
//# sourceMappingURL=forms.js.map