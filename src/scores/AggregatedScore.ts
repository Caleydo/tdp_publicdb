/**
 * Created by sam on 06.03.2017.
 */

import { IPluginDesc } from 'visyn_core/plugin';
import { IScore, IParams } from 'tdp_core';
import { IDataSourceConfig } from '../common/config';
import { AAggregatedScore } from './AAggregatedScore';
import { ScoreUtils } from './ScoreUtils';
import { ParameterFormIds } from '../common/forms';
import { FrequencyScore, FrequencyDepletionScore } from './FrequencyScore';
import { AFrequencyScore } from './AFrequencyScore';

export class AggregatedScore extends AAggregatedScore implements IScore<number> {
  protected getViewPrefix() {
    return '';
  }

  static createAggregationFrequencyScore(data, pluginDesc: IPluginDesc): IScore<number> {
    return AggregatedScore.initializeAggregationFrequencyScore(
      data,
      pluginDesc,
      (d, primary, opposite) => new AggregatedScore(d, primary, opposite),
      (d, primary, opposite, countOnly) => new FrequencyScore(d, primary, opposite, countOnly),
    );
  }

  static initializeAggregationFrequencyScore(
    data,
    pluginDesc: IPluginDesc,
    aggregatedScoreFactory: (data, primary: IDataSourceConfig, opposite: IDataSourceConfig) => AAggregatedScore,
    frequencyScoreFactory: (data, primary: IDataSourceConfig, opposite: IDataSourceConfig, countOnly: boolean) => AFrequencyScore,
  ) {
    const { primary, opposite } = ScoreUtils.selectDataSources(pluginDesc);
    const aggregation = data[ParameterFormIds.AGGREGATION];
    if (aggregation === 'frequency' || aggregation === 'count') {
      // boolean to indicate that the resulting score does not need to be divided by the total count
      const countOnly = aggregation === 'count';
      return frequencyScoreFactory(data, primary, opposite, countOnly);
    }
    return aggregatedScoreFactory(data, primary, opposite);
  }
}

export class AggregatedDepletionScore extends AAggregatedScore implements IScore<number> {
  protected getViewPrefix() {
    return 'depletion_';
  }

  protected createFilter(): IParams {
    return {
      depletionscreen: this.dataSubType.filter,
    };
  }

  // Factories for depletion scores for DRIVE data
  static createAggregatedDepletionScore(data, pluginDesc: IPluginDesc): IScore<number> {
    return AggregatedScore.initializeAggregationFrequencyScore(
      data,
      pluginDesc,
      (d, primary, opposite) => new AggregatedDepletionScore(d, primary, opposite),
      (d, primary, opposite, countOnly) => new FrequencyDepletionScore(d, primary, opposite, countOnly),
    );
  }
}
