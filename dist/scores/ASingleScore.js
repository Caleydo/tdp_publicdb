/**
 * Created by sam on 06.03.2017.
 */
import { resolve } from 'phovea_core/src/idtype';
import { getSelectedSpecies } from 'tdp_gene/src/common';
import { MAX_FILTER_SCORE_ROWS_BEFORE_ALL } from '../config';
import { convertLog2ToLinear, limitScoreRows } from 'tdp_gene/src/utils';
import { createDesc } from './utils';
import { AScore } from './AScore';
import { getTDPScore } from 'tdp_core/src/rest';
export class ASingleScore extends AScore {
    constructor(parameter, dataSource, oppositeDataSource) {
        super(parameter);
        this.parameter = parameter;
        this.dataSource = dataSource;
        this.oppositeDataSource = oppositeDataSource;
    }
    get idType() {
        return resolve(this.dataSource.idType);
    }
    createDesc() {
        return Object.assign(createDesc(this.dataSubType.type, `${this.parameter.name.text}: ${this.dataSubType.name}`, this.dataSubType, `${this.oppositeDataSource.name} Name: "${this.parameter.name.text}"\nData Type: ${this.dataType.name}\nData Subtype: ${this.dataSubType.name}`), {
            scoreID: `dC${`${this.dataSubType.name} of ${this.parameter.name.text}`.replace(/\s+/, '')}` // column name that is stored in old provenance graphs
        });
    }
    createFilter() {
        return {};
    }
    async compute(ids, idtype, namedSet) {
        const param = {
            table: this.dataType.tableName,
            attribute: this.dataSubType.id,
            name: this.parameter.name.id,
            species: getSelectedSpecies(),
            target: idtype.id
        };
        const maxDirectRows = typeof this.parameter.maxDirectFilterRows === 'number' ? this.parameter.maxDirectFilterRows : MAX_FILTER_SCORE_ROWS_BEFORE_ALL;
        limitScoreRows(param, ids, idtype, this.dataSource.entityName, maxDirectRows, namedSet);
        const filters = this.createFilter();
        const rows = await getTDPScore(this.dataSource.db, `${this.getViewPrefix()}${this.dataSource.base}_${this.oppositeDataSource.base}_single_score`, param, filters);
        if (this.dataSubType.useForAggregation.indexOf('log2') !== -1) {
            return convertLog2ToLinear(rows, 'score');
        }
        return rows;
    }
}
//# sourceMappingURL=ASingleScore.js.map