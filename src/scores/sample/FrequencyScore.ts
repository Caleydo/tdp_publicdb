/**
 * Created by sam on 06.03.2017.
 */

import * as ajax from 'phovea_core/src/ajax';
import * as ranges from 'phovea_core/src/range';
import * as idtypes from 'phovea_core/src/idtype';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {
  IDataSourceConfig, IDataTypeConfig, dataSubtypes, allBioTypes
} from '../../config';
import {IScore} from 'ordino/src/LineUpView';
import {createDesc} from '../utils';
import {ICommonScoreParam} from './ICommonScoreParam';


interface IInvertedFrequencyScoreParam extends ICommonScoreParam {
  data_type:IDataTypeConfig;
  comparison_operator: string;
  comparison_value: number;
}

export default class InvertedFrequencyScore implements IScore<number> {
  constructor(private parameter: IInvertedFrequencyScoreParam, private dataSource: IDataSourceConfig, private countOnly) {

  }

  createDesc() {
    const subtype = this.parameter.data_subtype;
    return createDesc(dataSubtypes.number, `${subtype.name} ${this.parameter.comparison_operator} ${this.parameter.comparison_value} ${this.countOnly ? 'Count' : 'Frequency'}  ${this.parameter.bio_type === allBioTypes ? '' : '@ '+this.parameter.bio_type}`, subtype);
  }

  async compute(ids:ranges.Range, idtype:idtypes.IDType):Promise<any[]> {
    const url = `/targid/db/${this.dataSource.db}/frequency_score_inverted${this.parameter.bio_type===allBioTypes ? '_all' : ''}`;
    const param = {
        schema: this.dataSource.schema,
        entity_name: this.dataSource.entityName,
        table_name: this.parameter.data_type.tableName,
        data_subtype: this.parameter.data_subtype.useForAggregation,
        biotype: this.parameter.bio_type,
        operator: this.parameter.comparison_operator,
        value: this.parameter.comparison_value,
        species: getSelectedSpecies()
      };

    const rows = await ajax.getAPIJSON(url, param);
    rows.forEach((row) => row.score = this.countOnly ? row.count : row.count / row.total);
    return rows;
  }
}
