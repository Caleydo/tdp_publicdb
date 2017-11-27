/**
 * Created by sam on 06.03.2017.
 */

import {IDataSourceConfig} from '../config';
import {IScore} from 'tdp_core/src/extensions';
import {ICommonScoreParam} from './AScore';
import {IBoxPlotData} from 'lineupjs/src/model/BoxPlotColumn';
import {IParams} from 'tdp_core/src/rest';
import AAggregatedScore from './AAggregatedScore';

interface IAggregatedScoreParam extends ICommonScoreParam {
  aggregation: string;
}

function array2boxplotData(arr: number[]) {
  //order: 0, 0.25, 0.5, 0.75, 1
  return <IBoxPlotData>{
    min: arr[0],
    q1: arr[1],
    median: arr[2],
    q3: arr[3],
    max: arr[4]
  };
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
