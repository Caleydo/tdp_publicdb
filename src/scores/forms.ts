import {ParameterFormIds, MUTATION_AGGREGATION, NUMERIC_AGGREGATION, COMPARISON_OPERATORS, FORM_DATA_HIEARCHICAL_SUBTYPE} from '../forms';
import {FormElementType} from 'ordino/src/form';
import {dataTypes, mutation, expression, copyNumber} from '../config';
/**
 * Created by Samuel Gratzl on 15.03.2017.
 */


export const FORM_AGGREGATED_SCORE = [
  {
    type: FormElementType.SELECT,
    label: 'Data Type',
    id: ParameterFormIds.DATA_TYPE,
    required: true,
    options: {
      optionsData: dataTypes.map((ds) => {
        return {name: ds.name, value: ds.id, data: ds.id};
      })
    },
    useSession: true
  },
  {
    type: FormElementType.SELECT,
    label: 'Data Subtype',
    id: ParameterFormIds.DATA_SUBTYPE,
    dependsOn: [ParameterFormIds.DATA_TYPE],
    required: true,
    options: {
      optionsFnc: (selection) => {
        const id = selection[0].data;
        const r = dataTypes.find((d) => d.id === id).dataSubtypes.filter((d) => d.type !== 'string');
        return r.map((ds) => {
          return {name: ds.name, value: ds.id, data: ds.id};
        });
      },
      optionsData: []
    },
    useSession: true
  },
  {
    type: FormElementType.SELECT,
    label: 'Aggregation',
    id: ParameterFormIds.AGGREGATION,
    dependsOn: [ParameterFormIds.DATA_TYPE],
    required: true,
    options: {
      optionsFnc: (selection) => {
        if (selection[0].data === mutation.id) {
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
    dependsOn: [ParameterFormIds.DATA_TYPE, ParameterFormIds.AGGREGATION],
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
    dependsOn: [ParameterFormIds.DATA_TYPE, ParameterFormIds.AGGREGATION],
    showIf: (dependantValues) => // show form element for expression and copy number frequencies
      ((dependantValues[1].value === 'frequency' || dependantValues[1].value === 'count') && (dependantValues[0].data === expression.id || dependantValues[0].data === copyNumber.id)),
    useSession: true,
    options: {
      type: 'number'
    }
  }
];

export const FORM_SINGLE_SCORE = [
  FORM_DATA_HIEARCHICAL_SUBTYPE
];
