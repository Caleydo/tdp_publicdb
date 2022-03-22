/**
 * Created by sam on 06.03.2017.
 */

import { IScore, IParams } from 'tdp_core';
import { AFrequencyScore } from './AFrequencyScore';

export class FrequencyScore extends AFrequencyScore implements IScore<number> {
  protected getViewPrefix() {
    return '';
  }
}

export class FrequencyDepletionScore extends AFrequencyScore implements IScore<number> {
  protected getViewPrefix() {
    return 'depletion_';
  }

  protected createFilter(): IParams {
    return {
      depletionscreen: this.dataSubType.id === 'ceres' ? 'Avana' : 'Drive',
    };
  }
}
