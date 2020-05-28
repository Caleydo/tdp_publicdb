/**
 * Created by sam on 06.03.2017.
 */

import {IDataSourceConfig} from '../common/config';
import {IScore} from 'tdp_core';
import {ICommonScoreParam} from './AScore';
import {IParams} from 'tdp_core';
import {AAggregatedScore} from './AAggregatedScore';

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
}
