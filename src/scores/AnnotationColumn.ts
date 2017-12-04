import {IScore} from 'tdp_core/src/extensions';
import {FormDialog} from 'tdp_core/src/form';
import ABooleanScore, {IBooleanScoreParams} from './ABooleanScore';
import {IDataSourceConfig} from '../config';
import {FormElementType} from 'tdp_core/src/form';
import {getAPIJSON} from 'phovea_core/src/ajax';
import {IPluginDesc} from 'phovea_core/src/plugin';
import {selectDataSources} from './utils';
import {chooseDataSource} from '../config';


/**
 * interface describing the parameter needed for MyScore
 */
export interface IAnnotationColumnParam extends IBooleanScoreParams {
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

  protected get columnName() {
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
export async function create(pluginDesc: IPluginDesc) {
  const dialog = new FormDialog('Add Annotation Column', 'Add');

  const dataSource = chooseDataSource(pluginDesc);

  const data = await getAPIJSON(`/tdp/db/publicdb/${dataSource.base}_panel`);
  const optionsData = data.map((item) => ({ name: item.id, value: item.id }));

  dialog.append({
    type: FormElementType.SELECT,
    label: 'Named Set',
    id: 'panel',
    attributes: {
      style: 'width:100%'
    },
    required: true,
    options: {
      optionsData
    }
  });

  return dialog.showAsPromise((r) => {
    // returning the whole data object, since there it contains all needed for the score
    const data = r.getElementValues();
    return <IAnnotationColumnParam>data;
  });
}
