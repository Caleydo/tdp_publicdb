/**
 * Created by Samuel Gratzl on 27.04.2016.
 */

import * as dialogs from 'phovea_ui/src/dialogs';
import {IPluginDesc} from 'phovea_core/src/plugin';
import {
  dataTypes, IDataTypeConfig, expression, copyNumber, mutation, gene, IDataSourceConfig,
  chooseDataSource
} from '../../config';
import {
  ParameterFormIds, COMPARISON_OPERATORS, MUTATION_AGGREGATION, FORM_GENE_FILTER,
  NUMERIC_AGGREGATION
} from '../../forms';
import {IScore} from 'ordino/src/LineUpView';
import {FormBuilder, FormElementType, IFormElementDesc} from 'ordino/src/FormBuilder';
import {api2absURL, getAPIJSON} from 'phovea_core/src/ajax';
import {select} from 'd3';
import AggregatedScore from './AggregatedScore';
import FrequencyScore from './FrequencyScore';
import MutationFrequencyScore from './MutationFrequencyScore';
import {convertRow2MultiMap} from 'ordino/src/form/internal/FormMap';


export function create(pluginDesc: IPluginDesc) {
  const ds = chooseDataSource(pluginDesc);
  // resolve promise when closing or submitting the modal dialog
  return new Promise((resolve) => {
    const dialog = dialogs.generateDialog('Add Aggregated Score Column', 'Add Aggregated Score Column');

    const form:FormBuilder = new FormBuilder(select(dialog.body));
    const formDesc:IFormElementDesc[] = [
      FORM_GENE_FILTER,
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
            const r = dataTypes.find((d) => d.id === id).dataSubtypes.filter((d) =>d.type !== 'string');
            return r.map((ds) => {
              return {name: ds.name, value: ds.id, data: ds};
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
            if(selection[0].data === mutation) {
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
          ((dependantValues[1].value === 'frequency' || dependantValues[1].value === 'count')  && (dependantValues[0].data === expression.id || dependantValues[0].data === copyNumber.id)),
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

    form.build(formDesc);

    dialog.onSubmit(() => {
      const data = form.getElementData();
      data.filter =  convertRow2MultiMap(data.filter);
      data.sampleType = ds.idType;

      dialog.hide();
      resolve(data);
      return false;
    });

    dialog.onHide(() => {
      dialog.destroy();
    });

    dialog.show();
  });
}

export function createScore(data): IScore<number> {
  const ds = chooseDataSource(data);
  const aggregation = data[ParameterFormIds.AGGREGATION];
  if(aggregation === 'frequency' || aggregation === 'count') {
    // boolean to indicate that the resulting score does not need to be divided by the total count
    const countOnly = aggregation === 'count';
    return new FrequencyScore(data, ds, countOnly);
  }
  return new AggregatedScore(data, ds);
}
