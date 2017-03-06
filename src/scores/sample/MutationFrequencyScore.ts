/**
 * Created by sam on 06.03.2017.
 */

import * as ajax from 'phovea_core/src/ajax';
import * as ranges from 'phovea_core/src/range';
import * as idtypes from 'phovea_core/src/idtype';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {IDataSourceConfig, dataSubtypes, allBioTypes} from '../../config';
import {IScore} from 'ordino/src/LineUpView';
import {createDesc} from '../utils';
import {ICommonScoreParam} from './ICommonScoreParam';

interface IInvertedMutationFrequencyScoreParam extends ICommonScoreParam {
  comparison_operator: string;
  comparison_value: number;
}

export default class InvertedMutationFrequencyScore implements IScore<number> {
  constructor(private parameter: IInvertedMutationFrequencyScoreParam, private dataSource: IDataSourceConfig, private countOnly) {

  }

  createDesc() {
    const subtype = this.parameter.data_subtype;
    return createDesc(dataSubtypes.number, `${subtype.name} ${this.countOnly ? 'Count' : 'Frequency'} ${this.parameter.bio_type === allBioTypes ? '' : '@ '+this.parameter.bio_type}`, subtype);
  }

  async compute(ids:ranges.Range, idtype:idtypes.IDType):Promise<any[]> {
    const url = `/targid/db/${this.dataSource.db}/mutation_frequency_inverted${this.parameter.bio_type===allBioTypes ? '_all' : ''}`;
    const param = {
        schema: this.dataSource.schema,
        entity_name: this.dataSource.entityName,
        data_subtype: this.parameter.data_subtype.useForAggregation,
        biotype: this.parameter.bio_type,
        species: getSelectedSpecies()
      };

    const rows = await ajax.getAPIJSON(url, param);
    rows.forEach((row) => this.countOnly ? row.count : row.count / row.total);
    return rows;
  }
}
