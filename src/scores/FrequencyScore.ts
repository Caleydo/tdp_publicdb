/**
 * Created by sam on 06.03.2017.
 */

import {RangeLike} from 'phovea_core/src/range';
import IDType from 'phovea_core/src/idtype/IDType';
import {getSelectedSpecies} from 'tdp_gene/src/common';
import {IDataSourceConfig, dataSubtypes, mutation, MAX_FILTER_SCORE_ROWS_BEFORE_ALL} from '../config';
import {IScore} from 'tdp_core/src/extensions';
import {createDesc, toFilterString} from './utils';
import AScore, {ICommonScoreParam} from './AScore';
import {limitScoreRows} from 'tdp_gene/src/utils';
import {INamedSet} from 'tdp_core/src/storage';
import {resolve} from 'phovea_core/src/idtype';
import {getTDPScore} from 'tdp_core/src/rest';
import {toFilter} from 'tdp_core/src/lineup';
import AFrequencyScore from './AFrequencyScore';

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
}
