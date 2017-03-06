/**
 * Created by sam on 06.03.2017.
 */

import * as ajax from 'phovea_core/src/ajax';
import * as ranges from 'phovea_core/src/range';
import * as idtypes from 'phovea_core/src/idtype';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {IDataSourceConfig, IDataTypeConfig} from '../../config';
import {convertLog2ToLinear} from '../../utils';
import {IScore} from 'ordino/src/LineUpView';
import {createDesc} from '../utils';
import {ICommonScoreParam} from './ICommonScoreParam';

interface IInvertedSingleGeneScore extends ICommonScoreParam {
  data_type:IDataTypeConfig;
  data_source: IDataSourceConfig;
  tumor_type: string;
  aggregation: string;
  entity_value: {id: string, text: string};
}

export default class InvertedSingleGeneScore implements IScore<any> {
  constructor(private parameter: IInvertedSingleGeneScore, private dataSource: IDataSourceConfig) {

  }

  createDesc(): any {
    const subtype = this.parameter.data_subtype;
    return createDesc(subtype.type, `${this.parameter.data_subtype.name} of ${this.parameter.entity_value.text}`, subtype);
  }

  async compute(ids:ranges.Range, idtype:idtypes.IDType):Promise<any[]> {
    const url = `/targid/db/${this.dataSource.db}/single_entity_score_inverted`;
    const param = {
        schema: this.dataSource.schema,
        entity_name: this.dataSource.entityName,
        table_name: this.parameter.data_type.tableName,
        data_subtype: this.parameter.data_subtype.id,
        entity_value: this.parameter.entity_value.id,
        species: getSelectedSpecies()
      };

    const rows: any[] = await ajax.getAPIJSON(url, param);
    if (this.parameter.data_subtype.useForAggregation.indexOf('log2') !== -1) {
      return convertLog2ToLinear(rows, 'score');
    }
    return rows;
  }
}
