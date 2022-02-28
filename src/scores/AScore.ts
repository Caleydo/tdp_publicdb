/**
 * Created by sam on 06.03.2017.
 */

import { resolveDataTypes, IDataTypeConfig, IDataSubtypeConfig } from '../common/config';

export interface IScoreFilter {
  name: string | string[]; // including named set special handling
  names: string | string[]; // name of named set with names
  panel: string | string[]; // name of the panel
  strand: string | string[];
  biotype: string | string[];
}

export interface ICommonScoreParam {
  data_type: string;
  data_subtype: string;
  filter: IScoreFilter;
  /**
   * see config.MAX_FILTER_SCORE_ROWS_BEFORE_ALL maximal number of rows for computing limiting the score to this subset
   */
  maxDirectFilterRows?: number;
}

export class AScore {
  protected readonly dataType: IDataTypeConfig;

  protected readonly dataSubType: IDataSubtypeConfig;

  constructor(parameter: { data_type: string; data_subtype: string }) {
    const { dataType, dataSubType } = resolveDataTypes(parameter.data_type, parameter.data_subtype);
    this.dataType = dataType;
    this.dataSubType = dataSubType;
  }
}
