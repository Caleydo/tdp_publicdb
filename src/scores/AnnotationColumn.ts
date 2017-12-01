import {IScore} from 'tdp_core/src/extensions';
import {FormDialog} from 'tdp_core/src/form';
import ABooleanScore from './ABooleanScore';
import {IDataSourceConfig} from '../config';
import {ICommonScoreParam} from './AScore';
import {FormElementType} from 'tdp_core/src/form';
import {getAPIJSON} from 'phovea_core/src/ajax';
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
export async function create(pluginDesc: IPluginDesc) {
  const dialog = new FormDialog('Add Annotation Column', 'Add');

  const idType = pluginDesc.idtype;
  const type = idType === 'Cellline' || idType === 'Tissue'? idType : 'gene';

  const data = await getAPIJSON(`/tdp/db/publicdb/${type.toLowerCase()}_panel`);
  const optionsData = data.map((item) => ({ name: item.id, value: item.id }));

  dialog.append({
    type: FormElementType.SELECT,
    label: 'Named Set',
    id: ParameterFormIds.PANEL,
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
