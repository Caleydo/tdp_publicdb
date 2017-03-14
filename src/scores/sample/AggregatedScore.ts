/**
 * Created by sam on 06.03.2017.
 */

import * as ajax from 'phovea_core/src/ajax';
import * as ranges from 'phovea_core/src/range';
import * as idtypes from 'phovea_core/src/idtype';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {IDataSourceConfig, IDataTypeConfig, dataSubtypes, allBioTypes} from '../../config';
import {convertLog2ToLinear} from '../../utils';
import {IScore} from 'ordino/src/LineUpView';
import {createDesc} from '../utils';
import AScore, {ICommonScoreParam} from './AScore';
import {toFilter} from '../../utils';

interface IAggregatedScoreParam extends ICommonScoreParam {
  aggregation: string;
}

export default class AggregatedScore extends AScore implements IScore<number> {

  constructor(private readonly parameter: IAggregatedScoreParam, private readonly ds: IDataSourceConfig) {
    super(parameter);
  }

  createDesc() {
    return createDesc(dataSubtypes.number, `${this.parameter.aggregation} ${this.dataSubType.name}`, this.dataSubType);
  }

  async compute(ids: ranges.Range, idtype: idtypes.IDType): Promise<any[]> {
    const url = `/targid/db/${this.ds.db}/${this.ds.base}_score/filter`;

    const param = {
      table: this.dataType.tableName,
      // by convention for the aggregation to do its magic, it has to be called `data_subtype`
      data_subtype: this.dataSubType.useForAggregation,
      agg: this.parameter.aggregation,
      species: getSelectedSpecies()
    };
    toFilter(param, this.parameter.filter);

    const rows: any[] = await ajax.getAPIJSON(url, param);
    if (this.dataSubType.useForAggregation.indexOf('log2') !== -1) {
      return convertLog2ToLinear(rows, 'score');
    }
    return rows;
  }
}
