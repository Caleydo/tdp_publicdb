/**
 * Created by sam on 06.03.2017.
 */

import {generateDialog} from 'phovea_ui/src/dialogs';
import {getAPIJSON, api2absURL} from 'phovea_core/src/ajax';
import {Range} from 'phovea_core/src/range';
import {IDType} from 'phovea_core/src/idtype';
import {select} from 'd3';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {IDataSourceConfig, gene, tissue, cellline} from '../config';
import {convertLog2ToLinear} from '../utils';
import {IScore} from 'ordino/src/LineUpView';
import {createDesc} from './utils';
import {IFormElementDesc} from 'ordino/src/form';
import FormBuilder from 'ordino/src/form/FormBuilder';
import {ParameterFormIds, FORM_GENE_NAME, FORM_TISSUE_NAME, FORM_CELLLINE_NAME} from 'targid_boehringer/src/forms';
import {IPluginDesc} from 'phovea_core/src/plugin';
import AScore from './AScore';
import {FORM_SINGLE_SCORE} from './forms';
import {selectDataSources} from './utils';

interface ISingleScoreParam {
  sampleType: string;
  name: {id: string, text: string};
  data_type: string;
  data_subtype: string;
}

export default class SingleScore extends AScore implements IScore<any> {
  constructor(private parameter: ISingleScoreParam, private readonly dataSource: IDataSourceConfig, private readonly oppositeDataSource: IDataSourceConfig) {
    super(parameter);
  }

  createDesc(): any {
    return createDesc(this.dataSubType.type, `${this.dataSubType.name} of ${this.parameter.name.text}`, this.dataSubType);
  }

  async compute(ids:Range, idtype:IDType):Promise<any[]> {
    const url = `/targid/db/${this.dataSource.db}/${this.dataSource.base}_${this.oppositeDataSource.base}_single_score`;
    const param = {
      table: this.dataType.tableName,
      attribute: this.dataSubType.id,
      name: this.parameter.name.id,
      species: getSelectedSpecies()
    };

    const rows: any[] = await getAPIJSON(url, param);
    if (this.dataSubType.useForAggregation.indexOf('log2') !== -1) {
      return convertLog2ToLinear(rows, 'score');
    }
    return rows;
  }
}

export function create(pluginDesc: IPluginDesc) {
  const {primary} = selectDataSources(pluginDesc);
  // resolve promise when closing or submitting the modal dialog
  return new Promise<ISingleScoreParam>((resolve) => {
    const dialog = generateDialog('Add Single Score Column', 'Add Single Score Column');

    const form:FormBuilder = new FormBuilder(select(dialog.body));
    const formDesc:IFormElementDesc[] = FORM_SINGLE_SCORE.slice();

    switch(primary) {
      case gene:
        formDesc.unshift(FORM_GENE_NAME);
        break;
      case tissue:
        formDesc.unshift(FORM_TISSUE_NAME);
        break;
      case cellline:
        formDesc.unshift(FORM_CELLLINE_NAME);
        break;
    }

    form.build(formDesc);

    dialog.onSubmit(() => {
      const data = <ISingleScoreParam>form.getElementData();

      switch (primary) {
        case gene:
          data.name = data[ParameterFormIds.GENE_SYMBOL];
          delete data[ParameterFormIds.GENE_SYMBOL];
          break;
        case tissue:
          data.name = data[ParameterFormIds.TISSUE_NAME];
          delete data[ParameterFormIds.TISSUE_NAME];
          break;
        case cellline:
          data.name = data[ParameterFormIds.CELLLINE_NAME];
          delete data[ParameterFormIds.CELLLINE_NAME];
          break;
      }

      dialog.hide();
      resolve(data);
      return false;
    });

    dialog.onHide(() => {
      dialog.destroy();
    });

    dialog.show();
  });
}


export function createScore(data: ISingleScoreParam, pluginDesc: IPluginDesc): IScore<number> {
  const {primary, opposite} = selectDataSources(pluginDesc);
  return new SingleScore(data, primary, opposite);
}
