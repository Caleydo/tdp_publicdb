import { FormDialog } from 'tdp_core';
import { ABooleanScore } from './ABooleanScore';
import { FormElementType } from 'tdp_core';
import { AppContext } from 'phovea_core';
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
        return new AnnotationColumn(data, primary);
    }
    /**
     * builder function for building the parameters of the score
     * @returns {Promise<IAnnotationColumnParam>} a promise for the parameter
     */
    static async createAnnotationColumn(pluginDesc) {
        const dialog = new FormDialog('Add Annotation Column', 'Add');
        const dataSource = chooseDataSource(pluginDesc);
        const data = await AppContext.getInstance().getAPIJSON(`/tdp/db/publicdb/${dataSource.base}_panel`);
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
            return data;
        });
    }
}
//# sourceMappingURL=AnnotationColumn.js.map