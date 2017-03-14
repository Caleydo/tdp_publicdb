/**
 * Created by sam on 06.03.2017.
 */

import {getAPIJSON} from 'phovea_core/src/ajax';
import Range from 'phovea_core/src/range/Range';
import IDType from 'phovea_core/src/idtype/IDType';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {IDataSourceConfig, IDataTypeConfig, dataSubtypes, allBioTypes, IDataSubtypeConfig, mutation} from '../../config';
import {IScore} from 'ordino/src/LineUpView';
import {createDesc} from '../utils';
import AScore, {ICommonScoreParam} from './AScore';
import {toFilter} from '../../utils';

interface IFrequencyScoreParam extends ICommonScoreParam {
  comparison_operator: string;
  comparison_value: number;
}

export default class FrequencyScore extends AScore implements IScore<number> {

  constructor(private readonly parameter: IFrequencyScoreParam, private readonly ds: IDataSourceConfig, private readonly countOnly: boolean) {
    super(parameter);
  }

  createDesc() {
    const subtype = this.dataSubType;
    return createDesc(dataSubtypes.number, `${subtype.name} ${this.parameter.comparison_operator} ${this.parameter.comparison_value} ${this.countOnly ? 'Count' : 'Frequency'}`, subtype);
  }

  async compute(ids: Range, idtype: IDType): Promise<any[]> {
    const isMutation = this.dataType === mutation;
    const url = `/targid/db/${this.ds.db}/${this.ds.base}${isMutation ? '_mutation': ''}_frequency_score`;
    const param: any = {
      attribute: this.dataSubType.useForAggregation,
      species: getSelectedSpecies()
    };
    if (!isMutation) {
      param.table = this.dataType.tableName;
      param.operator = this.parameter.comparison_operator;
      param.value = this.parameter.comparison_value;
    }
    toFilter(param, this.parameter.filter);

    const rows = await getAPIJSON(url, param);
    rows.forEach((row) => row.score = this.countOnly ? row.count : row.count / row.total);
    return rows;
  }
}
