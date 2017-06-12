/**
 * Created by sam on 06.03.2017.
 */

import {getAPIJSON} from 'phovea_core/src/ajax';
import {RangeLike} from 'phovea_core/src/range';
import IDType from 'phovea_core/src/idtype/IDType';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {IDataSourceConfig, dataSubtypes, mutation} from '../config';
import {IScore} from 'ordino/src/LineUpView';
import {createDesc, toFilterString} from './utils';
import AScore, {ICommonScoreParam} from './AScore';
import {toFilter, limitScoreRows} from '../utils';
import {INamedSet} from 'ordino/src/storage';
import {resolve} from 'phovea_core/src/idtype';

interface IFrequencyScoreParam extends ICommonScoreParam {
  comparison_operator: string;
  comparison_value: number;
}

export default class FrequencyScore extends AScore implements IScore<number> {

  constructor(private readonly parameter: IFrequencyScoreParam,private readonly dataSource: IDataSourceConfig, private readonly oppositeDataSource: IDataSourceConfig, private readonly countOnly: boolean) {
    super(parameter);
  }

  get idType() {
    return resolve(this.dataSource.idType);
  }

  createDesc() {
    const ds = this.oppositeDataSource;
    const subtype = this.dataSubType;
    const isMutation = this.dataType === mutation;
    const compare = !isMutation ? `${this.parameter.comparison_operator} ${this.parameter.comparison_value} `: '';
    const desc = `${ds.name} Filter: ${toFilterString(this.parameter.filter, ds)}\nData Type: ${this.dataType.name}\nData Subtype: ${this.dataSubType.name}\n${this.countOnly ? 'Count' : 'Frequency'}: ${compare}`;
    return createDesc(dataSubtypes.number, `${subtype.name} ${compare}${this.countOnly ? 'Count' : 'Frequency'}`, subtype, desc);
  }

  async compute(ids: RangeLike, idtype: IDType, namedSet?: INamedSet): Promise<any[]> {
    const isMutation = this.dataType === mutation;
    const url = `/targid/db/${this.dataSource.db}/${this.dataSource.base}_${this.oppositeDataSource.base}_frequency_score/score`;
    const param: any = {
      attribute: this.dataSubType.useForAggregation,
      species: getSelectedSpecies(),
      table: this.dataType.tableName,
      target: idtype.id
    };
    limitScoreRows(param, ids, this.dataSource, namedSet);
    if (!isMutation) {
      param.operator = this.parameter.comparison_operator;
      param.value = this.parameter.comparison_value;
    } else {
      param.operator = '=';
      param.value = 'true';
    }
    toFilter(param, this.parameter.filter);

    const rows = await getAPIJSON(url, param);
    rows.forEach((row) => row.score = this.countOnly ? row.count : row.count / row.total);
    return rows;
  }
}
