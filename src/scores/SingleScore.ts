/**
 * Created by sam on 06.03.2017.
 */

import {generateDialog} from 'phovea_ui/src/dialogs';
import {getAPIJSON} from 'phovea_core/src/ajax';
import {Range, RangeLike} from 'phovea_core/src/range';
import {resolve} from 'phovea_core/src/idtype';
import IDType from 'phovea_core/src/idtype/IDType';
import {select} from 'd3';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {IDataSourceConfig, gene, tissue, cellline} from '../config';
import {convertLog2ToLinear, limitScoreRows} from '../utils';
import {IScore} from 'ordino/src/LineUpView';
import {createDesc} from './utils';
import {IFormElementDesc, FormElementType} from 'ordino/src/form';
import FormBuilder from 'ordino/src/form/FormBuilder';
import {ParameterFormIds, FORM_GENE_NAME, FORM_TISSUE_NAME, FORM_CELLLINE_NAME} from 'targid_boehringer/src/forms';
import {IPluginDesc} from 'phovea_core/src/plugin';
import AScore from './AScore';
import {FORM_SINGLE_SCORE} from './forms';
import {selectDataSources} from './utils';
import {mixin} from 'phovea_core/src';
import {INamedSet} from 'ordino/src/storage';

interface ISingleScoreParam {
  name: {id: string, text: string};
  data_type: string;
  data_subtype: string;
}

export default class SingleScore extends AScore implements IScore<any> {
  constructor(private parameter: ISingleScoreParam, private readonly dataSource: IDataSourceConfig, private readonly oppositeDataSource: IDataSourceConfig) {
    super(parameter);
  }

  get idType() {
    return resolve(this.dataSource.idType);
  }

  createDesc(): any {
    const ds = this.oppositeDataSource;
    return createDesc(this.dataSubType.type, `${this.dataSubType.name} of ${this.parameter.name.text}`, this.dataSubType,
    `${ds.name} Name: "${this.parameter.name.text}"\nData Type: ${this.dataType.name}\nData Subtype: ${this.dataSubType.name}`);
  }

  async compute(ids:RangeLike, idtype:IDType, namedSet?: INamedSet):Promise<any[]> {
    const url = `/targid/db/${this.dataSource.db}/${this.dataSource.base}_${this.oppositeDataSource.base}_single_score/score`;
    const param: any = {
      table: this.dataType.tableName,
      attribute: this.dataSubType.id,
      name: this.parameter.name.id,
      species: getSelectedSpecies(),
      target: idtype.id
    };
    limitScoreRows(param, ids, this.dataSource, namedSet);

    const rows: any[] = await getAPIJSON(url, param);
    if (this.dataSubType.useForAggregation.indexOf('log2') !== -1) {
      return convertLog2ToLinear(rows, 'score');
    }
    return rows;
  }
}

function enableMultiple(desc: any): any {
  return mixin({}, desc, {
    type: FormElementType.SELECT2_MULTIPLE,
  });
}

export function create(pluginDesc: IPluginDesc) {
  const {opposite} = selectDataSources(pluginDesc);
  // resolve promise when closing or submitting the modal dialog
  return new Promise<ISingleScoreParam>((resolve) => {
    const dialog = generateDialog('Add Single Score Column', 'Add Single Score Column');

    const form:FormBuilder = new FormBuilder(select(dialog.body));
    const formDesc:IFormElementDesc[] = FORM_SINGLE_SCORE.slice();

    switch(opposite) {
      case gene:
        formDesc.unshift(enableMultiple(FORM_GENE_NAME));
        break;
      case tissue:
        formDesc.unshift(enableMultiple(FORM_TISSUE_NAME));
        break;
      case cellline:
        formDesc.unshift(enableMultiple(FORM_CELLLINE_NAME));
        break;
    }

    form.build(formDesc);

    dialog.onSubmit(() => {
      if (!form.validate()) {
        return false;
      }
      const data = <any>form.getElementData();

      {
        const datatypes = data[ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE];
        delete data[ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE];
        const resolved = datatypes.map((entry) => entry.id.split('-'));
        if (datatypes.length === 1) {
          data.data_type = resolved[0][0];
          data.data_subtype = resolved[0][1];
        } else {
          data.data_types = resolved;
        }
      }

      switch (opposite) {
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


export function createScore(data: ISingleScoreParam, pluginDesc: IPluginDesc): IScore<number>|IScore<any>[] {
  const {primary, opposite} = selectDataSources(pluginDesc);
  const configs = (<any>data).data_types;
  function defineScore(name: {id: string, text: string}) {
    if (configs) {
      return configs.map((ds) => new SingleScore({name, data_type: ds[0], data_subtype: ds[1]}, primary, opposite));
    } else {
      return new SingleScore(Object.assign({}, data, { name }), primary, opposite);
    }
  }
  if (Array.isArray(data.name)) {
    return [].concat(...data.name.map((name) => defineScore(name)));
  } else {
    return defineScore(data.name);
  }
}
