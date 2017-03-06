/**
 * Created by sam on 06.03.2017.
 */

import * as ajax from 'phovea_core/src/ajax';
import * as ranges from 'phovea_core/src/range';
import * as idtypes from 'phovea_core/src/idtype';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {allTypes, IDataSourceConfig, IDataSubtypeConfig, dataSubtypes} from '../../config';
import {IScore} from 'ordino/src/LineUpView';
import {createDesc} from '../utils';

export default class MutationFrequencyScore implements IScore<number> {
  constructor(private parameter: {
    tumor_type: string,
    data_subtype: IDataSubtypeConfig,
    comparison_operator: string,
    comparison_value: number
  },
              private dataSource: IDataSourceConfig,
              private countOnly) {

  }

  createDesc(): any {
    const subtype = this.parameter.data_subtype;
    const label = `${subtype.name} ${this.countOnly ? 'Count' : 'Frequency'} ${this.parameter.tumor_type === allTypes ? '' : '@ ' + this.parameter.tumor_type}`;
    //always a number
    return createDesc(dataSubtypes.number, label, subtype);
  }

  compute(ids: ranges.Range, idtype: idtypes.IDType): Promise<any[]> {
    const url = `/targid/db/${this.dataSource.db}/mutation_frequency${this.parameter.tumor_type === allTypes ? '_all' : ''}`;
    const param = {
      schema: this.dataSource.schema,
      entity_name: this.dataSource.entityName,
      data_subtype: this.parameter.data_subtype.useForAggregation,
      tumortype: this.parameter.tumor_type,
      species: getSelectedSpecies()
    };

    return ajax.getAPIJSON(url, param)
      .then((rows: any[]) => {
        return rows.map((row) => {
          row.score = this.countOnly ? row.count : row.count / row.total;
          return row;
        });
      });
  }
}
