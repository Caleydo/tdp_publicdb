/**
 * Created by sam on 06.03.2017.
 */

import {RangeLike} from 'phovea_core';
import {IDType} from 'phovea_core';
import {SpeciesUtils} from 'tdp_gene';
import {IDataSourceConfig, dataSubtypes, mutation, MAX_FILTER_SCORE_ROWS_BEFORE_ALL} from '../common/config';
import {IScore} from 'tdp_core';
import {ScoreUtils} from './ScoreUtils';
import {AScore, ICommonScoreParam} from './AScore';
import {FieldUtils} from 'tdp_gene';
import {INamedSet} from 'tdp_core';
import {IDTypeManager} from 'phovea_core';
import {RestBaseUtils, IParams} from 'tdp_core';
import {LineupUtils} from 'tdp_core';

interface IFrequencyScoreParam extends ICommonScoreParam {
  comparison_operator: string;
  comparison_value: number;
  comparison_cn?: { text: string, data: number }[];
}

export abstract class AFrequencyScore extends AScore implements IScore<number> {

  constructor(private readonly parameter: IFrequencyScoreParam,private readonly dataSource: IDataSourceConfig, private readonly oppositeDataSource: IDataSourceConfig, private readonly countOnly: boolean) {
    super(parameter);
  }

  get idType() {
    return IDTypeManager.getInstance().resolveIdType(this.dataSource.idType);
  }

  createDesc() {
    const ds = this.oppositeDataSource;
    const subtype = this.dataSubType;
    const isMutation = this.dataType === mutation;
    const isCopyNumberClass = this.dataSubType.id === 'copynumberclass';
    let compare = '';
    if (isCopyNumberClass) {
      compare = ` one of (${this.parameter.comparison_cn.map((d) => d.text).join(', ')})`;
    } else if (!isMutation) {
      compare = ` ${this.parameter.comparison_operator} ${this.parameter.comparison_value}`;
    }
    const desc = `${ds.name} Filter: ${ScoreUtils.toFilterString(this.parameter.filter, ds)}\nData Type: ${this.dataType.name}\nData Subtype: ${this.dataSubType.name}\nAggregation: ${this.countOnly ? 'Count' : 'Frequency'}${compare}`;
    return ScoreUtils.createDesc(dataSubtypes.number, `${subtype.name}${compare} ${this.countOnly ? 'Count' : 'Frequency'}`, subtype, desc);
  }

  async compute(ids: RangeLike, idtype: IDType, namedSet?: INamedSet): Promise<any[]> {
    const isMutation = this.dataType === mutation;
    const isCopyNumberClass = this.dataSubType.id === 'copynumberclass';
    const param: any = {
      attribute: this.dataSubType.useForAggregation,
      species: SpeciesUtils.getSelectedSpecies(),
      table: this.dataType.tableName,
      target: idtype.id
    };
    if (!isMutation && !isCopyNumberClass) {
      param.operator = this.parameter.comparison_operator;
      param.value = this.parameter.comparison_value;
    }
    if (isCopyNumberClass) {
      param.value = this.parameter.comparison_value;
    }
    const maxDirectRows = typeof this.parameter.maxDirectFilterRows === 'number' ? this.parameter.maxDirectFilterRows : MAX_FILTER_SCORE_ROWS_BEFORE_ALL;
    FieldUtils.limitScoreRows(param, ids, idtype, this.dataSource.entityName, maxDirectRows, namedSet);
    const filters = Object.assign(LineupUtils.toFilter(this.parameter.filter), this.createFilter());

    const rows: any[] = await RestBaseUtils.getTDPScore(this.dataSource.db, `${this.getViewPrefix()}${this.dataSource.base}_${this.oppositeDataSource.base}_frequency_${isMutation? 'mutation_' : ''}${isCopyNumberClass? 'copynumberclass_' : ''}score`, param, filters);
    rows.forEach((row) => row.score = this.countOnly ? row.count : row.count / row.total);
    return rows;
  }

  protected createFilter(): IParams {
    return {};
  }

  protected abstract getViewPrefix(): string;
}
