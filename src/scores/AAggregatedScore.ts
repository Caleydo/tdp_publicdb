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
import {toFilter} from 'tdp_core/src/lineup';
import IDType from 'phovea_core/src/idtype/IDType';


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

abstract class AAggregatedScore extends AScore implements IScore<number> {

  constructor(private readonly parameter: IAggregatedScoreParam, private readonly dataSource: IDataSourceConfig, private readonly oppositeDataSource: IDataSourceConfig) {
    super(parameter);
  }

  get idType() {
    return resolve(this.dataSource.idType);
  }

  createDesc() {
    const ds = this.oppositeDataSource;
    const desc = `${ds.name} Filter: ${toFilterString(this.parameter.filter, ds)}\nData Type: ${this.dataType.name}\nData Subtype: ${this.dataSubType.name}\nAggregation: ${this.parameter.aggregation}`;
    return createDesc(this.parameter.aggregation === 'boxplot' ? 'boxplot' : dataSubtypes.number, `${this.parameter.aggregation} ${this.dataSubType.name}`, this.dataSubType, desc);
  }

  async compute(ids: RangeLike, idtype: IDType, namedSet?: INamedSet): Promise<any[]> {
    const param = {
      table: this.dataType.tableName,
      // by convention for the aggregation to do its magic, it has to be called `data_subtype`
      data_subtype: this.dataSubType.useForAggregation,
      agg: this.parameter.aggregation,
      species: getSelectedSpecies(),
      target: idtype.id
    };
    const maxDirectRows = typeof this.parameter.maxDirectFilterRows === 'number' ? this.parameter.maxDirectFilterRows : MAX_FILTER_SCORE_ROWS_BEFORE_ALL;
    limitScoreRows(param, ids, idtype, this.dataSource.entityName, maxDirectRows, namedSet);
    const filters = toFilter(this.parameter.filter);

    let rows: IScoreRow<any>[] = await getTDPScore(this.dataSource.db, `${this.getURLPrefix()}${this.dataSource.base}_${this.oppositeDataSource.base}_score`, param, filters);
    if (this.parameter.aggregation === 'boxplot') {
      rows = rows.filter((d) => d.score !== null);
      rows.forEach((row) => row.score = array2boxplotData(row.score));
    }
    if (this.dataSubType.useForAggregation.indexOf('log2') !== -1) {
      return convertLog2ToLinear(rows, 'score');
    }
    return rows;
  }

  protected abstract getURLPrefix(): string;
}

export default AAggregatedScore;
