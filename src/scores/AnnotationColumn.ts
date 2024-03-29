import { I18nextManager } from 'visyn_core/i18n';
import { AppContext } from 'visyn_core/base';
import { IPluginDesc } from 'visyn_core/plugin';
import { IScore, FormDialog, FormElementType } from 'tdp_core';
import { chooseDataSource } from '../common/config';
import { ABooleanScore, IBooleanScoreParams } from './ABooleanScore';
import { ScoreUtils } from './ScoreUtils';

/**
 * interface describing the parameter needed for MyScore
 */
export interface IAnnotationColumnParam extends IBooleanScoreParams {
  panel: string;
}

/**
 * score implementation in this case a numeric score is computed
 */
export class AnnotationColumn extends ABooleanScore implements IScore<number> {
  protected get label() {
    return `${this.dataSource.name} contained in ${this.params.panel}`;
  }

  protected get columnName() {
    return 'namedset_containment';
  }

  static createAnnotationColumnScore(data: IAnnotationColumnParam | IAnnotationColumnParam[], pluginDesc: IPluginDesc) {
    const { primary } = ScoreUtils.selectDataSources(pluginDesc);
    data = (Array.isArray(data) ? data : [data]) as IAnnotationColumnParam[];
    return data.map((d) => new AnnotationColumn(d, primary));
  }

  /**
   * builder function for building the parameters of the score
   * @returns {Promise<IAnnotationColumnParam>} a promise for the parameter
   */
  static async createAnnotationColumn(pluginDesc: IPluginDesc) {
    const dialog = new FormDialog(I18nextManager.getInstance().i18n.t('tdp:publicdb.addAnnotation'), I18nextManager.getInstance().i18n.t('tdp:publicdb.add'));

    const dataSource = chooseDataSource(pluginDesc);

    const data = await AppContext.getInstance().getAPIJSON(`/tdp/db/publicdb/${dataSource.base}_panel`);
    const optionsData = data.map((item) => ({ text: item.id, id: item.id }));

    dialog.append({
      type: FormElementType.SELECT2_MULTIPLE,
      label: 'Named Set',
      id: 'panels',
      attributes: {
        style: 'width:100%',
      },
      required: true,
      options: {
        data: optionsData,
      },
    });

    return dialog.showAsPromise((r) => {
      const panels = r.getElementValues()?.panels.map(({ id }) => ({ panel: id }));
      return <IAnnotationColumnParam[]>panels;
    });
  }
}
