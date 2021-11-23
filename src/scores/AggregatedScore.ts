/**
 * Created by sam on 06.03.2017.
 */

import {IDataSourceConfig} from '../common/config';
import {IScore} from 'tdp_core';
import {ICommonScoreParam} from './AScore';
import {IParams} from 'tdp_core';
import {AAggregatedScore} from './AAggregatedScore';
import {IPluginDesc} from 'tdp_core';
import { ScoreUtils } from './ScoreUtils';
import {ParameterFormIds} from '../common/forms';
import { FrequencyScore, FrequencyDepletionScore } from './FrequencyScore';
import { AFrequencyScore } from './AFrequencyScore';

interface IAggregatedScoreParam extends ICommonScoreParam {
  aggregation: string;
}

export class AggregatedScore extends AAggregatedScore implements IScore<number> {
  constructor(parameter: IAggregatedScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig) {
    super(parameter, dataSource, oppositeDataSource);
  }

  protected getViewPrefix() {
    return '';
  }
  static createAggregationFrequencyScore(data, pluginDesc: IPluginDesc): IScore<number> {
    return AggregatedScore.initializeAggregationFrequencyScore(data, pluginDesc, (data, primary, opposite) => new AggregatedScore(data, primary, opposite), (data, primary, opposite, countOnly) => new FrequencyScore(data, primary, opposite, countOnly));
  }
  static initializeAggregationFrequencyScore(data, pluginDesc: IPluginDesc, aggregatedScoreFactory: (data, primary: IDataSourceConfig, opposite: IDataSourceConfig) => AAggregatedScore, frequencyScoreFactory: (data, primary: IDataSourceConfig, opposite: IDataSourceConfig, countOnly: boolean) => AFrequencyScore) {
    const {primary, opposite} = ScoreUtils.selectDataSources(pluginDesc);
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
  constructor(parameter: IAggregatedScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig) {
    super(parameter, dataSource, oppositeDataSource);
  }

  protected getViewPrefix() {
    return 'depletion_';
  }

  protected createFilter(): IParams {
    return {
      depletionscreen: this.dataSubType.id === 'ceres' ? 'Avana' : 'Drive'
    };
  }
  // Factories for depletion scores for DRIVE data
  static createAggregatedDepletionScore(data, pluginDesc: IPluginDesc): IScore<number> {
    return AggregatedScore.initializeAggregationFrequencyScore(data, pluginDesc, (data, primary, opposite) => new AggregatedDepletionScore(data, primary, opposite), (data, primary, opposite, countOnly) => new FrequencyDepletionScore(data, primary, opposite, countOnly));
  }
}
