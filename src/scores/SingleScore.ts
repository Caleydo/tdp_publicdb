/**
 * Created by sam on 06.03.2017.
 */

import {Range, RangeLike} from 'phovea_core/src/range';
import {resolve, IDType} from 'phovea_core/src/idtype';
import {getSelectedSpecies} from 'tdp_gene/src/common';
import {IDataSourceConfig, gene, tissue, cellline, MAX_FILTER_SCORE_ROWS_BEFORE_ALL, splitTypes} from '../config';
import {convertLog2ToLinear, limitScoreRows} from 'tdp_gene/src/utils';
import {IScore} from 'tdp_core/src/extensions';
import {createDesc} from './utils';
import {IFormElementDesc, FormElementType} from 'tdp_core/src/form';
import {ParameterFormIds, FORM_GENE_NAME, FORM_TISSUE_NAME, FORM_CELLLINE_NAME} from '../forms';
import {IPluginDesc} from 'phovea_core/src/plugin';
import AScore from './AScore';
import {
  FORCE_COMPUTE_ALL_CELLLINE, FORCE_COMPUTE_ALL_GENES, FORCE_COMPUTE_ALL_TISSUE,
  FORM_SINGLE_SCORE
} from './forms';
import {selectDataSources} from './utils';
import {mixin} from 'phovea_core/src';
import {INamedSet} from 'tdp_core/src/storage';
import {FormDialog} from 'tdp_core/src/form';
import {getTDPScore} from 'tdp_core/src/rest';

interface ISingleScoreParam {
  name: {id: string, text: string};
  data_type: string;
  data_subtype: string;
  /**
   * see config.MAX_FILTER_SCORE_ROWS_BEFORE_ALL maximal number of rows for computing limiting the score to this subset
   */
  maxDirectFilterRows?: number;
}

export default class SingleScore extends AScore implements IScore<any> {
  constructor(private parameter: ISingleScoreParam, private readonly dataSource: IDataSourceConfig, private readonly oppositeDataSource: IDataSourceConfig) {
    super(parameter);
  }

  get idType() {
    return resolve(this.dataSource.idType);
  }

  createDesc(): any {
    return createDesc(this.dataSubType.type, `${this.dataSubType.name} of ${this.parameter.name.text}`, this.dataSubType,
    `${this.oppositeDataSource.name} Name: "${this.parameter.name.text}"\nData Type: ${this.dataType.name}\nData Subtype: ${this.dataSubType.name}`);
  }

  async compute(ids:RangeLike, idtype:IDType, namedSet?: INamedSet):Promise<any[]> {
    const param: any = {
      table: this.dataType.tableName,
      attribute: this.dataSubType.id,
      name: this.parameter.name.id,
      species: getSelectedSpecies(),
      target: idtype.id
    };
    const maxDirectRows = typeof this.parameter.maxDirectFilterRows === 'number' ? this.parameter.maxDirectFilterRows : MAX_FILTER_SCORE_ROWS_BEFORE_ALL;
    limitScoreRows(param, ids, idtype, this.dataSource.entityName, maxDirectRows, namedSet);

    const rows = await getTDPScore(this.dataSource.db, `${this.dataSource.base}_${this.oppositeDataSource.base}_single_score`, param);
    if (this.dataSubType.useForAggregation.indexOf('log2') !== -1) {
      return convertLog2ToLinear(rows, 'score');
    }
    return rows;
  }
}

function enableMultiple(desc: any): any {
  return mixin({}, desc, {
    type: FormElementType.SELECT2_MULTIPLE,
    useSession: false
  });
}

export function create(pluginDesc: IPluginDesc, extra: any, countHint?: number) {
  const {primary, opposite} = selectDataSources(pluginDesc);
  const dialog = new FormDialog('Add Single Score Column', 'Add Single Score Column');
  const formDesc:IFormElementDesc[] = FORM_SINGLE_SCORE.slice();
  switch(opposite) {
    case gene:
      formDesc.unshift(enableMultiple(FORM_GENE_NAME));
      formDesc.push(primary === tissue ? FORCE_COMPUTE_ALL_TISSUE : FORCE_COMPUTE_ALL_CELLLINE);
      break;
    case tissue:
      formDesc.unshift(enableMultiple(FORM_TISSUE_NAME));
      formDesc.push(FORCE_COMPUTE_ALL_GENES);
      break;
    case cellline:
      formDesc.unshift(enableMultiple(FORM_CELLLINE_NAME));
      formDesc.push(FORCE_COMPUTE_ALL_GENES);
      break;
  }

  if (typeof countHint === 'number' && countHint > MAX_FILTER_SCORE_ROWS_BEFORE_ALL) {
    formDesc.pop();
  }

  dialog.append(...formDesc);

  return dialog.showAsPromise((builder) => {
    const data = <any>builder.getElementData();

    {
      const datatypes = data[ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE];
      delete data[ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE];
      const resolved = datatypes.map((entry) => {
        const {dataType, dataSubType} = splitTypes(entry.id);
        return [dataType.id, dataSubType.id];
      });
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
    return data;
  });
}


export function createScore(data: ISingleScoreParam, pluginDesc: IPluginDesc): IScore<number>|IScore<any>[] {
  const {primary, opposite} = selectDataSources(pluginDesc);
  const configs = (<any>data).data_types;
  function defineScore(name: {id: string, text: string}) {
    if (configs) {
      return configs.map((ds) => new SingleScore({name, data_type: ds[0], data_subtype: ds[1], maxDirectFilterRows: data.maxDirectFilterRows}, primary, opposite));
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
