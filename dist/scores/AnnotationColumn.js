import { FormDialog } from 'tdp_core';
import { ABooleanScore } from './ABooleanScore';
import { FormElementType } from 'tdp_core';
import { AppContext, I18nextManager } from 'tdp_core';
import { ScoreUtils } from './ScoreUtils';
import { chooseDataSource } from '../common/config';
/**
 * score implementation in this case a numeric score is computed
 */
export class AnnotationColumn extends ABooleanScore {
    constructor(params, dataSource) {
        super(params, dataSource);
    }
    get label() {
        return `${this.dataSource.name} contained in ${this.params.panel}`;
    }
    get columnName() {
        return 'namedset_containment';
    }
    static createAnnotationColumnScore(data, pluginDesc) {
        const { primary } = ScoreUtils.selectDataSources(pluginDesc);
        data = (Array.isArray(data) ? data : [data]);
        return data.map((d) => new AnnotationColumn(d, primary));
    }
    /**
     * builder function for building the parameters of the score
     * @returns {Promise<IAnnotationColumnParam>} a promise for the parameter
     */
    static async createAnnotationColumn(pluginDesc) {
        const dialog = new FormDialog(I18nextManager.getInstance().i18n.t('tdp:publicdb.addAnnotation'), I18nextManager.getInstance().i18n.t('tdp:publicdb.add'), `form-dialog-${pluginDesc.id}`);
        const dataSource = chooseDataSource(pluginDesc);
        const data = await AppContext.getInstance().getAPIJSON(`/tdp/db/publicdb/${dataSource.base}_panel`);
        const optionsData = data.map((item) => ({ text: item.id, id: item.id }));
        dialog.append({
            type: FormElementType.SELECT2_MULTIPLE,
            label: 'Named Set',
            id: 'panels',
            attributes: {
                style: 'width:100%'
            },
            required: true,
            options: {
                data: optionsData
            }
        });
        return dialog.showAsPromise((r) => {
            var _a;
            const panels = (_a = r.getElementValues()) === null || _a === void 0 ? void 0 : _a.panels.map(({ id }) => ({ panel: id }));
            return panels;
        });
    }
}
//# sourceMappingURL=AnnotationColumn.js.map