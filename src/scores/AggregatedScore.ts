/**
 * Created by sam on 06.03.2017.
 */

import * as ajax from 'phovea_core/src/ajax';
import * as ranges from 'phovea_core/src/range';
import * as idtypes from 'phovea_core/src/idtype';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {IDataSourceConfig, dataSubtypes} from '../config';
import {convertLog2ToLinear} from '../utils';
import {IScore} from 'ordino/src/LineUpView';
import {createDesc} from './utils';
import AScore, {ICommonScoreParam} from './AScore';
import {toFilter} from '../utils';
import {IBoxPlotData} from 'lineupjs/src/model/BoxPlotColumn';

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

export default class AggregatedScore extends AScore implements IScore<number> {

  constructor(private readonly parameter: IAggregatedScoreParam, private readonly dataSource: IDataSourceConfig, private readonly oppositeDataSource: IDataSourceConfig) {
    super(parameter);
  }

  createDesc() {
    return createDesc(dataSubtypes.number, `${this.parameter.aggregation} ${this.dataSubType.name}`, this.dataSubType);
  }

  async compute(ids: ranges.Range, idtype: idtypes.IDType): Promise<any[]> {
    const url = `/targid/db/${this.dataSource.db}/${this.dataSource.base}_${this.oppositeDataSource.base}_score/filter`;

    const param = {
      table: this.dataType.tableName,
      // by convention for the aggregation to do its magic, it has to be called `data_subtype`
      data_subtype: this.dataSubType.useForAggregation,
      agg: this.parameter.aggregation,
      species: getSelectedSpecies()
    };
    toFilter(param, this.parameter.filter);

    const rows: any[] = await ajax.getAPIJSON(url, param);
    if (this.parameter.aggregation === 'boxplot') {
      rows.forEach((row) => row.score = array2boxplotData(row.score));
    }
    if (this.dataSubType.useForAggregation.indexOf('log2') !== -1) {
      return convertLog2ToLinear(rows, 'score');
    }
    return rows;
  }
}
