import { ColumnDescUtils, RestBaseUtils } from 'tdp_core';
import { FormDialog } from 'tdp_core';
import { MAX_FILTER_SCORE_ROWS_BEFORE_ALL } from '../common/config';
import { FormElementType } from 'tdp_core';
import { AppContext, IDTypeManager, I18nextManager } from 'tdp_core';
import { ScoreUtils } from './ScoreUtils';
import { SpeciesUtils, FieldUtils } from 'tdp_gene';
/**
 * Score implementation
 */
export class GeneSignatureScore {
    constructor(params, dataSource, options) {
        this.params = params;
        this.dataSource = dataSource;
        this.options = options;
    }
    /**
     * Defines the IDType of which score values are returned. A score row is a pair of id and its score, e.g. {id: 'EGFR', score: 100}
     * @type {IDType}
     */
    get idType() {
        return IDTypeManager.getInstance().resolveIdType(this.dataSource.idType);
    }
    /**
     * Creates the column description used within LineUp to create the oclumn
     * @returns {IAdditionalColumnDesc}
     */
    createDesc() {
        const label = this.options.description;
        return ColumnDescUtils.numberCol('_gene_signature', -5, 5, { label });
    }
    /**
     * Computes the actual scores and returns a Promise of IScoreRow rows.
     * @returns {Promise<IScoreRow<number>[]>}
     */
    async compute(ids, idtype, namedSet) {
        const params = {
            signature: this.params.signature,
            species: SpeciesUtils.getSelectedSpecies()
        };
        FieldUtils.limitScoreRows(params, ids, idtype, this.dataSource.entityName, MAX_FILTER_SCORE_ROWS_BEFORE_ALL, namedSet);
        return RestBaseUtils.getTDPScore(this.dataSource.db, `${this.dataSource.base}_gene_signature_score`, params);
    }
    static createGeneSignatureScore(data, pluginDesc) {
        const { primary } = ScoreUtils.selectDataSources(pluginDesc);
        data = (Array.isArray(data) ? data : [data]);
        return data.map(({ params, options }) => new GeneSignatureScore(params, primary, options));
    }
    /**
     * Builder function for building the parameters of the score.
     * @returns {Promise<ISignatureColumnParam>} a promise for the parameter.
     */
    static async createGeneSignatureDialog(pluginDesc) {
        const dialog = new FormDialog(I18nextManager.getInstance().i18n.t('tdp:publicdb.addGeneSignature'), I18nextManager.getInstance().i18n.t('tdp:publicdb.add'));
        const data = await AppContext.getInstance().getAPIJSON(`/tdp/db/publicdb/gene_signature`);
        const optionsData = data.map((item) => ({ text: `${item.id} (${item.description})`, id: item.id }));
        dialog.append({
            type: FormElementType.SELECT2_MULTIPLE,
            label: 'Signatures',
            id: 'signatures',
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
            const signatures = (_a = r.getElementValues()) === null || _a === void 0 ? void 0 : _a.signatures.map(({ id }) => {
                return {
                    params: {
                        signature: id
                    },
                    options: {
                        description: (data.find((item) => item.id === id).description)
                    }
                };
            });
            return signatures;
        });
    }
}
//# sourceMappingURL=GeneSignatureScore.js.map