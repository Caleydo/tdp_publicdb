/**
 * Created by sam on 06.03.2017.
 */

import {generateDialog} from 'phovea_ui/src/dialogs';
import {getAPIJSON, api2absURL} from 'phovea_core/src/ajax';
import {Range} from 'phovea_core/src/range';
import {IDType} from 'phovea_core/src/idtype';
import {select} from 'd3';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {IDataSourceConfig, IDataTypeConfig, dataTypes, IDataSubtypeConfig, gene, chooseDataSource} from '../../config';
import {convertLog2ToLinear} from '../../utils';
import {IScore} from 'ordino/src/LineUpView';
import {createDesc} from '../utils';
import {IFormElementDesc, FormElementType} from 'ordino/src/form';
import FormBuilder from 'ordino/src/form/FormBuilder';
import {ParameterFormIds} from 'targid_boehringer/src/forms';
import {IPluginDesc} from 'phovea_core/src/plugin';
import AScore from './AScore';

interface ISingleScoreParam {
  sampleType: string;
  gene_symbol: {id: string, text: string};
  data_type: string;
  data_subtype: string;
}

export default class SingleScore extends AScore implements IScore<any> {
  constructor(private parameter: ISingleScoreParam, private readonly ds: IDataSourceConfig) {
    super(parameter);
  }

  createDesc(): any {
    return createDesc(this.dataSubType.type, `${this.dataSubType.name} of ${this.parameter.gene_symbol.text}`, this.dataSubType);
  }

  async compute(ids:Range, idtype:IDType):Promise<any[]> {
    const url = `/targid/db/${this.ds.db}/${this.ds.base}_single_score`;
    const param = {
      table: this.dataType.tableName,
      attribute: this.dataSubType.id,
      name: this.parameter.gene_symbol.id,
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
  const ds = chooseDataSource(pluginDesc);
  // resolve promise when closing or submitting the modal dialog
  return new Promise<ISingleScoreParam>((resolve) => {
    const dialog = generateDialog('Add Single Score Column', 'Add Single Score Column');

    const form:FormBuilder = new FormBuilder(select(dialog.body));
    const formDesc:IFormElementDesc[] = [
      {
        type: FormElementType.SELECT2,
        label: 'Gene Symbol',
        id: ParameterFormIds.GENE_SYMBOL,
        attributes: {
          style: 'width:100%'
        },
        options: {
          optionsData: [],
          ajax: {
            url: api2absURL(`/targid/db/${gene.db}/gene_items/lookup`),
            data: (params:any) => {
              return {
                column: 'symbol',
                species: getSelectedSpecies(),
                query: params.term,
                page: params.page
              };
            }
          },
          templateResult: (item:any) => (item.id) ? `${item.text} <span class="ensg">${item.id}</span>` : item.text,
          templateSelection: (item:any) => (item.id) ? `${item.text} <span class="ensg">${item.id}</span>` : item.text
        },
        useSession: true
      },
      {
        type: FormElementType.SELECT,
        label: 'Data Type',
        id: ParameterFormIds.DATA_TYPE,
        options: {
          optionsData: dataTypes.map((ds) => {
            return {name: ds.name, value: ds.id, data: ds.id};
          })
        },
        useSession: true
      },
      {
        type: FormElementType.SELECT,
        label: 'Data Subtype',
        id: ParameterFormIds.DATA_SUBTYPE,
        dependsOn: [ParameterFormIds.DATA_TYPE],
        options: {
          optionsFnc: (selection) => {
            const id = selection[0].data;
            const r = dataTypes.find((d) => d.id === id).dataSubtypes;
            return r.map((ds) => {
              return {name: ds.name, value: ds.id, data: ds.id};
            });
          },
          optionsData: []
        },
        useSession: true
      }
    ];

    form.build(formDesc);

    dialog.onSubmit(() => {
      const data = <ISingleScoreParam>form.getElementData();
      data.sampleType = ds.idType;
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


export function createScore(data: ISingleScoreParam): IScore<number> {
  const ds = chooseDataSource(data);
  return new SingleScore(data, ds);
}
