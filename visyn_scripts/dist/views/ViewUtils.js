/**
 * Created by sam on 16.02.2017.
 */
import { FieldUtils } from 'tdp_gene';
import { ColumnDescUtils, IDTypeManager } from 'tdp_core';
import { zipWith } from 'lodash';
export class ViewUtils {
    static async loadFirstName(ensg) {
        const symbols = await IDTypeManager.getInstance().mapNameToFirstName(IDTypeManager.getInstance().resolveIdType('Ensembl'), [ensg], IDTypeManager.getInstance().resolveIdType('GeneSymbol'));
        return symbols.length > 0 ? symbols[0] : ensg;
    }
    static async loadGeneList(ensgs) {
        const symbols = await IDTypeManager.getInstance().mapNameToFirstName(IDTypeManager.getInstance().resolveIdType('Ensembl'), ensgs, IDTypeManager.getInstance().resolveIdType('GeneSymbol'));
        return zipWith(ensgs, symbols, (ensg, symbol) => {
            return {
                id: ensg,
                symbol,
            };
        });
    }
    static postProcessScore(subType) {
        return (rows) => {
            if (subType.useForAggregation.indexOf('log2') !== -1) {
                return FieldUtils.convertLog2ToLinear(rows, 'score');
            }
            if (subType.type === 'cat') {
                rows = rows
                    .filter((row) => row.score !== null)
                    .map((row) => {
                    row.score = row.score.toString();
                    return row;
                });
            }
            return rows;
        };
    }
    static subTypeDesc(dataSubType, id, label, col = `col_${id}`) {
        if (dataSubType.type === 'boolean' || dataSubType.type === 'string') {
            return ColumnDescUtils.stringCol(col, { label });
        }
        if (dataSubType.type === 'cat') {
            return ColumnDescUtils.categoricalCol(col, dataSubType.categories, { label });
        }
        return ColumnDescUtils.numberCol(col, dataSubType.domain[0], dataSubType.domain[1], { label });
    }
    /**
     * Extracts ranking options from .env file (via process.env) and returns them in an object that can be spread into the ranking options.
     */
    static rankingOptionsFromEnv() {
        return process.env.RANKING_ENABLE_VIS_PANEL == null ? {} : { enableVisPanel: JSON.parse(process.env.RANKING_ENABLE_VIS_PANEL) };
    }
}
//# sourceMappingURL=ViewUtils.js.map