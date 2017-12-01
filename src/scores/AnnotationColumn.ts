import {IScore, IScoreRow} from 'tdp_core/src/extensions';
import {FormDialog} from 'tdp_core/src/form';
import ABooleanScore from './ABooleanScore';
import {IDataSourceConfig} from '../config';
import {ICommonScoreParam} from './AScore';
import {FormElementType} from 'tdp_core/src/form';
import {getSelectedSpecies} from 'tdp_gene/src/common';
import {api2absURL} from 'phovea_core/src/ajax';
import {IPluginDesc} from 'phovea_core/src/plugin';
import {ParameterFormIds} from '../forms';
import {selectDataSources} from './utils';



/**
 * interface describing the parameter needed for MyScore
 */
export interface IAnnotationColumnParam extends ICommonScoreParam {
  panel: string;
}


/**
 * score implementation in this case a numeric score is computed
 */
export default class AnnotationColumn extends ABooleanScore implements IScore<number> {

  constructor(params: IAnnotationColumnParam, dataSource: IDataSourceConfig) {
    super(params, dataSource);
  }

  protected get label() {
    return `${this.dataSource.name} contained in ${(<IAnnotationColumnParam>this.params).panel}`;
  }

  protected get dbView() {
    return 'namedset_containment';
  }

}

export function createScore(data, pluginDesc: IPluginDesc) {
  const {primary} = selectDataSources(pluginDesc);
  return new AnnotationColumn(data, primary);
}


/**
 * builder function for building the parameters of the score
 * @returns {Promise<IAnnotationColumnParam>} a promise for the parameter
 */
export function create(pluginDesc: IPluginDesc) {
  /**
   * a formDialog is a modal dialog showing a form to the user. The first argument is the dialog title, the second the label of the submit button
   * @type {FormDialog}
   */
  const dialog = new FormDialog('Add Annotation Column', 'Add');

  // dialog.append({
  //   type: FormElementType.SELECT2,
  //   label: 'Named Set',
  //   id: ParameterFormIds.PANEL,
  //   attributes: {
  //     style: 'width:100%'
  //   },
  //   required: true,
  //   options: {
  //     optionsData: [],
  //     ajax: {
  //       url: api2absURL(`/tdp/db/publicdb/${pluginDesc.idtype.toLowerCase()}_panel`),
  //       data: (params: any) => {
  //         return {
  //           species: getSelectedSpecies(),
  //           query: params.term === undefined ? '' : params.term,
  //           page: params.page === undefined ? 0 : params.page
  //         };
  //       },
  //       processResults: (data) => {
  //         return data.map((item) => {
  //           item.text = item.id;
  //           return item;
  //         });
  //       }
  //     }
  //   }
  // });

  dialog.append({
    type: FormElementType.SELECT2,
    label: 'Named Set',
    id: ParameterFormIds.PANEL,
    attributes: {
      style: 'width:100%'
    },
    required: true,
    options: {
      data: [{id: 'Hello', text: 'World'}]
    }
  });

  return dialog.showAsPromise((r) => {
    // retrieve the entered values, each one identified by its formID
    const data = r.getElementValues();
    return <IAnnotationColumnParam>{
      panel: 'Eurofins320'
    };
  });
}
