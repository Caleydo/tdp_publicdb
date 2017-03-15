import {ParameterFormIds, MUTATION_AGGREGATION, NUMERIC_AGGREGATION, COMPARISON_OPERATORS} from '../forms';
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
    dependsOn: [ParameterFormIds.DATA_TYPE, ParameterFormIds.AGGREGATION],
    showIf: (dependantValues) => // show form element for expression and copy number frequencies
      ((dependantValues[1].value === 'frequency' || dependantValues[1].value === 'count') && (dependantValues[0].data === expression.id || dependantValues[0].data === copyNumber.id)),
    useSession: true
  }
];

export const FORM_SINGLE_SCORE = [
  {
    type: FormElementType.SELECT,
    label: 'Data Type',
    id: ParameterFormIds.DATA_TYPE,
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
    options: {
      optionsFnc: (selection) => {
        const id = selection[0].data;
        const r = dataTypes.find((d) => d.id === id).dataSubtypes;
        return r.map((ds) => {
          return {name: ds.name, value: ds.id, data: ds.id};
        });
      },
      optionsData: []
    },
    useSession: true
  }
];
