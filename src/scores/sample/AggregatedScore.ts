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
import {ICommonScoreParam} from './ICommonScoreParam';

interface IInvertedAggregatedScoreParam extends ICommonScoreParam {
  data_source: IDataSourceConfig;
  data_type: IDataTypeConfig;
  aggregation: string;
}

export default class InvertedAggregatedScore implements IScore<number> {
  constructor(private parameter: IInvertedAggregatedScoreParam, private dataSource: IDataSourceConfig) {
  }

  createDesc() {
    return createDesc(dataSubtypes.number, `${this.parameter.aggregation} ${this.parameter.data_subtype.name} @ ${this.parameter.bio_type}`, this.parameter.data_subtype);
  }

  async compute(ids: ranges.Range, idtype: idtypes.IDType): Promise<any[]> {
    const p = this.parameter;
    const ds = this.dataSource;
    const url = `/targid/db/${ds.db}/aggregated_score_inverted${p.bio_type === allBioTypes ? '_all' : ''}`;
    const param = {
      schema: ds.schema,
      entity_name: ds.entityName,
      table_name: p.data_type.tableName,
      data_subtype: p.data_subtype.useForAggregation,
      biotype: p.bio_type,
      agg: p.aggregation,
      species: getSelectedSpecies()
    };

    const rows: any[] = await ajax.getAPIJSON(url, param);
    if (this.parameter.data_subtype.useForAggregation.indexOf('log2') !== -1) {
      return convertLog2ToLinear(rows, 'score');
    }
    return rows;
  }
}
