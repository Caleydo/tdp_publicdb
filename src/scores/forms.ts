import {
  ParameterFormIds, MUTATION_AGGREGATION, NUMERIC_AGGREGATION, COMPARISON_OPERATORS,
  FORM_DATA_HIERARCHICAL_SUBTYPE, FORM_DATA_HIERARCHICAL_SUBTYPE_SINGLE_SELECTION
} from '../forms';
import {FormElementType} from 'ordino/src/form';
import {mutation, expression, copyNumber, MAX_FILTER_SCORE_ROWS_BEFORE_ALL, splitTypes} from '../config';
/**
 * Created by Samuel Gratzl on 15.03.2017.
 */


export const FORM_AGGREGATED_SCORE = [
  FORM_DATA_HIERARCHICAL_SUBTYPE_SINGLE_SELECTION,
  {
    type: FormElementType.SELECT,
    label: 'Aggregation',
    id: ParameterFormIds.AGGREGATION,
    dependsOn: [ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE],
    required: true,
    options: {
      optionsFnc: (selection) => {
        if(selection.length === 0 || selection[0].id === '') {
          return NUMERIC_AGGREGATION;
        }
        const {dataType} = splitTypes(selection[0].id);
        if (dataType.id === mutation.id) {
          return MUTATION_AGGREGATION;
        } else {
          return NUMERIC_AGGREGATION;
        }
      },
      optionsData: []
    },
    useSession: true
  },
  {
    type: FormElementType.SELECT,
    label: 'Comparison Operator',
    id: ParameterFormIds.COMPARISON_OPERATOR,
    dependsOn: [ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE, ParameterFormIds.AGGREGATION],
    required: true,
    showIf: (dependantValues) => // show form element for expression and copy number frequencies
      ((dependantValues[1].value === 'frequency' || dependantValues[1].value === 'count') && (dependantValues[0].data === expression.id || dependantValues[0].data === copyNumber.id)),
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
    showIf: (dependantValues) => // show form element for expression and copy number frequencies
      ((dependantValues[1].value === 'frequency' || dependantValues[1].value === 'count') && (dependantValues[0].data === expression.id || dependantValues[0].data === copyNumber.id)),
    useSession: true,
    options: {
      type: 'number'
    }
  }
];

const FORM_COMPUTE_BASE = {
  type: FormElementType.CHECKBOX,
  id: ParameterFormIds.SCORE_FORCE_DATASET_SIZE,
  options: {
    checked: -1,
    unchecked: MAX_FILTER_SCORE_ROWS_BEFORE_ALL
  },
  useSession: true
};

export const FORCE_COMPUTE_ALL_GENES = Object.assign({
  label: 'Compute score for all genes and not only for the selected subset'
}, FORM_COMPUTE_BASE);

export const FORCE_COMPUTE_ALL_TISSUE = Object.assign({
  label: 'Compute score for all tissues and not only for the selected subset'
}, FORM_COMPUTE_BASE);

export const FORCE_COMPUTE_ALL_CELLLINE = Object.assign({
  label: 'Compute score for all celllines and not only for the selected subset'
}, FORM_COMPUTE_BASE);


export const FORM_SINGLE_SCORE = [
  FORM_DATA_HIERARCHICAL_SUBTYPE
];
