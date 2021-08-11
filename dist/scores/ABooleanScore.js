import { IDTypeManager } from 'phovea_core';
import { ColumnDescUtils } from 'tdp_core';
import { RestBaseUtils } from 'tdp_core';
/**
 * score implementation in this case a numeric score is computed
 */
export class ABooleanScore {
    constructor(params, dataSource) {
        this.params = params;
        this.dataSource = dataSource;
    }
    /**
     * defines the IDType of which score values are returned. A score row is a pair of id and its score, e.g. {id: 'EGFR', score: 100}
     * @type {IDType}
     */
    get idType() {
        return IDTypeManager.getInstance().resolveIdType(this.dataSource.idType);
    }
    /**
     * creates the column description used within LineUp to create the oclumn
     * @returns {IAdditionalColumnDesc}
     */
    createDesc() {
        const label = this.label;
        return ColumnDescUtils.booleanCol(this.columnName, { label, width: 60 });
    }
    /**
     * computes the actual scores and returns a Promise of IScoreRow rows
     * @returns {Promise<IScoreRow<number>[]>}
     */
    compute() {
        return RestBaseUtils.getTDPScore(this.dataSource.db, `${this.dataSource.base}_${this.columnName}_score`, this.params);
    }
}
//# sourceMappingURL=ABooleanScore.js.map