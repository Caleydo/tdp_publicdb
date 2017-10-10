/**
 * Created by Samuel Gratzl on 27.04.2016.
 */

import {IPluginDesc} from 'phovea_core/src/plugin';
import {ParameterFormIds, FORM_GENE_FILTER, FORM_TISSUE_FILTER, FORM_CELLLINE_FILTER} from '../forms';
import {IScore} from 'tdp_core/src/extensions';
import {AggregatedScore, AggregatedDepletionScore} from './AggregatedScore';
import FrequencyScore from './FrequencyScore';
import {
  FORCE_COMPUTE_ALL_CELLLINE, FORCE_COMPUTE_ALL_GENES, FORCE_COMPUTE_ALL_TISSUE,
  FORM_AGGREGATED_SCORE, FORM_AGGREGATED_SCORE_DEPLETION
} from './forms';
import {gene, tissue, cellline, splitTypes, MAX_FILTER_SCORE_ROWS_BEFORE_ALL, IDataSourceConfig} from '../config';
import {selectDataSources} from './utils';
import {FormDialog, convertRow2MultiMap, IFormElementDesc}  from 'tdp_core/src/form';
import AAggregatedScore from './AAggregatedScore';


export function createScoreDialog(pluginDesc: IPluginDesc, extras: any, formDesc: IFormElementDesc[], countHint?: number) {
  const {primary, opposite} = selectDataSources(pluginDesc);

  const dialog = new FormDialog('Add Aggregated Score Column', 'Add Aggregated Score Column');
  switch(opposite) {
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

  return dialog.showAsPromise((builder) => {
    const data = builder.getElementData();
    const {dataType, dataSubType} = splitTypes(data[ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE].id);
    delete data[ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE];
    data.data_type = dataType.id;
    data.data_subtype = dataSubType.id;
    if (dataSubType.id === 'copynumberclass') {
      // cornercase in case of copynumber class we have an in :class list case
      data.comparison_value = `${(data.comparison_cn || []).map((d) => d.id).join(',')}`;
    } else {
      delete data.comparison_cn;
    }
    data.filter = convertRow2MultiMap(data.filter);
    return data;
  });
}

function initializeScore(data, pluginDesc: IPluginDesc, initAggregatedScore: (data, primary: IDataSourceConfig, opposite: IDataSourceConfig) => AAggregatedScore) {
  const {primary, opposite} = selectDataSources(pluginDesc);
  const aggregation = data[ParameterFormIds.AGGREGATION];
  if (aggregation === 'frequency' || aggregation === 'count') {
    // boolean to indicate that the resulting score does not need to be divided by the total count
    const countOnly = aggregation === 'count';
    return new FrequencyScore(data, primary, opposite, countOnly);
  }
  return initAggregatedScore(data, primary, opposite);
}

export function createScore(data, pluginDesc: IPluginDesc): IScore<number> {
  return initializeScore(data, pluginDesc, (data, primary, opposite) => new AggregatedScore(data, primary, opposite));
}


export function create(pluginDesc: IPluginDesc, extras: any, countHint?: number) {
  return createScoreDialog(pluginDesc, extras, FORM_AGGREGATED_SCORE.slice(), countHint);
}

// Factories for depletion scores for DRIVE data
export function createAggregatedDepletionScore(data, pluginDesc: IPluginDesc): IScore<number> {
  return initializeScore(data, pluginDesc, (data, primary, opposite) => new AggregatedDepletionScore(data, primary, opposite));
}

export function createAggregatedDepletionScoreDialog(pluginDesc: IPluginDesc, extras: any, countHint?: number) {
  return createScoreDialog(pluginDesc, extras, FORM_AGGREGATED_SCORE_DEPLETION.slice(), countHint);
}
