/**
 * Created by sam on 06.03.2017.
 */

import {Range, RangeLike} from 'phovea_core';
import {resolve, IDType} from 'phovea_core';
import {getSelectedSpecies} from 'tdp_gene';
import {IDataSourceConfig, MAX_FILTER_SCORE_ROWS_BEFORE_ALL} from '../config';
import {convertLog2ToLinear, limitScoreRows} from 'tdp_gene';
import {IScore} from 'tdp_core';
import {createDesc} from './utils';
import {AScore} from './AScore';
import {INamedSet} from 'tdp_core';
import {getTDPScore, IParams} from 'tdp_core';

interface ISingleScoreParam {
  name: {id: string, text: string};
  data_type: string;
  data_subtype: string;
  /**
   * see config.MAX_FILTER_SCORE_ROWS_BEFORE_ALL maximal number of rows for computing limiting the score to this subset
   */
  maxDirectFilterRows?: number;
}

export abstract class ASingleScore extends AScore implements IScore<any> {
  constructor(private parameter: ISingleScoreParam, private readonly dataSource: IDataSourceConfig, private readonly oppositeDataSource: IDataSourceConfig) {
    super(parameter);
  }

  get idType() {
    return resolve(this.dataSource.idType);
  }

  createDesc(): any {
    return Object.assign(createDesc(this.dataSubType.type, `${this.parameter.name.text}: ${this.dataSubType.name}`, this.dataSubType,
    `${this.oppositeDataSource.name} Name: "${this.parameter.name.text}"\nData Type: ${this.dataType.name}\nData Subtype: ${this.dataSubType.name}`), {
      scoreID: `dC${`${this.dataSubType.name} of ${this.parameter.name.text}`.replace(/\s+/,'')}` // column name that is stored in old provenance graphs
    });
  }

  protected createFilter(): IParams {
    return {};
  }

  async compute(ids:RangeLike, idtype:IDType, namedSet?: INamedSet):Promise<any[]> {
    const param: any = {
      table: this.dataType.tableName,
      attribute: this.dataSubType.id,
      name: this.parameter.name.id,
      species: getSelectedSpecies(),
      target: idtype.id
    };
    const maxDirectRows = typeof this.parameter.maxDirectFilterRows === 'number' ? this.parameter.maxDirectFilterRows : MAX_FILTER_SCORE_ROWS_BEFORE_ALL;
    limitScoreRows(param, ids, idtype, this.dataSource.entityName, maxDirectRows, namedSet);

    const filters = this.createFilter();

    const rows = await getTDPScore(this.dataSource.db, `${this.getViewPrefix()}${this.dataSource.base}_${this.oppositeDataSource.base}_single_score`, param, filters);
    if (this.dataSubType.useForAggregation.indexOf('log2') !== -1) {
      return convertLog2ToLinear(rows, 'score');
    }
    return rows;
  }

  protected abstract getViewPrefix(): string;
}
