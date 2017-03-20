/**
 * Created by sam on 06.03.2017.
 */

import * as ajax from 'phovea_core/src/ajax';
import * as ranges from 'phovea_core/src/range';
import * as idtypes from 'phovea_core/src/idtype';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {allTypes, IDataSourceConfig, IDataTypeConfig, IDataSubtypeConfig, dataSubtypes} from '../../config';
import {convertLog2ToLinear} from '../../utils';
import {IScore} from 'ordino/src/LineUpView';
import {createDesc} from '../utils';

export interface IAggregatedScoreParameter {
  data_source: IDataSourceConfig;
  data_type: IDataTypeConfig;
  data_subtype: IDataSubtypeConfig;
  aggregation: string;

  filter_by: string; //tumor_type vs panel
  tumor_type?: string;
  tissue_panel_name?: string;
}

export default class AggregatedScore implements IScore<number> {
  constructor(private parameter: IAggregatedScoreParameter, private dataSource: IDataSourceConfig) {

  }

  createDesc() {
    const subset = this.parameter.filter_by === 'tissue_panel' ? this.parameter.tissue_panel_name : this.parameter.tumor_type;
    return createDesc(dataSubtypes.number, `${this.parameter.aggregation} ${this.parameter.data_subtype.name} @ ${subset}`, this.parameter.data_subtype);
  }

  async compute(ids: ranges.Range, idtype: idtypes.IDType): Promise<any[]> {
    const param: any = {
      schema: this.dataSource.schema,
      entity_name: this.dataSource.entityName,
      table_name: this.parameter.data_type.tableName,
      data_subtype: this.parameter.data_subtype.useForAggregation,
      agg: this.parameter.aggregation
    };


    let url = `/targid/db/${this.dataSource.db}/aggregated_score`;
    switch (this.parameter.filter_by) {
      case 'tissue_panel':
        url += '_panel';
        param.panel = this.parameter.tissue_panel_name;
        break;
      default:
        param.species = getSelectedSpecies();
        if (this.parameter.tumor_type === allTypes) {
          url += '_all';
        } else {
          param.tumortype = this.parameter.tumor_type;
        }
    }

    const rows: any[] = await ajax.getAPIJSON(url, param);
    // convert log2 to linear scale
    if (this.parameter.data_subtype.useForAggregation.indexOf('log2') !== -1) {
      return convertLog2ToLinear(rows, 'score');
    }
    return rows;
  }
}
