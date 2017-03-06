/**
 * Created by sam on 06.03.2017.
 */

import * as ajax from 'phovea_core/src/ajax';
import * as ranges from 'phovea_core/src/range';
import * as idtypes from 'phovea_core/src/idtype';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {allTypes, IDataSourceConfig, expression, dataSubtypes} from '../../config';
import {IScore, IScoreRow} from 'ordino/src/LineUpView';
import {IBoxPlotData} from 'lineupjs/src/model/BoxPlotColumn';
import {createDesc} from '../utils';
import {IAggregatedScoreParameter} from './AggregatedScore';

export default class BoxScore implements IScore<IBoxPlotData> {
  constructor(private parameter: IAggregatedScoreParameter, private dataSource: IDataSourceConfig) {

  }

  createDesc() {
    const subset = this.parameter.filter_by === 'tissue_panel' ? this.parameter.tissue_panel_name : this.parameter.tumor_type;
    return createDesc(dataSubtypes.boxplot, `${this.parameter.aggregation} ${this.parameter.data_subtype.name} @ ${subset}`, this.parameter.data_subtype);
  }

  async compute(ids: ranges.Range, idtype: idtypes.IDType): Promise<IScoreRow<IBoxPlotData>[]> {
    const param: any = {
      schema: this.dataSource.schema,
      entity_name: this.dataSource.entityName,
      table_name: this.parameter.data_type.tableName,
      data_subtype: this.parameter.data_subtype.useForAggregation,
      agg: this.parameter.aggregation
    };

    let url = `/targid/db/${this.dataSource.db}/aggregated_score_boxplot`;
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
    return rows.map((d) => ({ id: d.id, score: d}));
  }
}
