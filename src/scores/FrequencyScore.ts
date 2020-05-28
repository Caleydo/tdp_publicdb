/**
 * Created by sam on 06.03.2017.
 */

import {IDataSourceConfig} from '../config';
import {IScore} from 'tdp_core';
import {ICommonScoreParam} from './AScore';
import {IParams} from 'tdp_core';
import {AFrequencyScore} from './AFrequencyScore';

interface IFrequencyScoreParam extends ICommonScoreParam {
  comparison_operator: string;
  comparison_value: number;
  comparison_cn?: { text: string, data: number }[];
}

export class FrequencyScore extends AFrequencyScore implements IScore<number> {
  constructor(parameter: IFrequencyScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig, countOnly: boolean) {
    super(parameter, dataSource, oppositeDataSource, countOnly);
  }

  protected getViewPrefix() {
    return '';
  }
}

export class FrequencyDepletionScore extends AFrequencyScore implements IScore<number> {
  constructor(parameter: IFrequencyScoreParam, dataSource: IDataSourceConfig, oppositeDataSource: IDataSourceConfig, countOnly: boolean) {
    super(parameter, dataSource, oppositeDataSource, countOnly);
  }

  protected getViewPrefix() {
    return 'depletion_';
  }

  protected createFilter(): IParams {
    return {
      depletionscreen: this.dataSubType.id === 'ceres' ? 'Avana' : 'Drive'
    };
  }
}
