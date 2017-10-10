/**
 * Created by sam on 06.03.2017.
 */

import {RangeLike} from 'phovea_core/src/range';
import {getSelectedSpecies} from 'tdp_gene/src/common';
import {IDataSourceConfig, dataSubtypes, MAX_FILTER_SCORE_ROWS_BEFORE_ALL} from '../config';
import {IScore, IScoreRow} from 'tdp_core/src/extensions';
import {createDesc, toFilterString} from './utils';
import AScore, {ICommonScoreParam} from './AScore';
import {limitScoreRows, convertLog2ToLinear} from 'tdp_gene/src/utils';
import {IBoxPlotData} from 'lineupjs/src/model/BoxPlotColumn';
import {INamedSet} from 'tdp_core/src/storage';
import {resolve} from 'phovea_core/src/idtype';
import {getTDPScore} from 'tdp_core/src/rest';
import IDType from 'phovea_core/src/idtype/IDType';
import {toFilter} from 'tdp_core/src/lineup';
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
}
