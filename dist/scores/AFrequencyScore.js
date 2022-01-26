import { SpeciesUtils } from 'tdp_gene';
import { dataSubtypes, mutation, MAX_FILTER_SCORE_ROWS_BEFORE_ALL } from '../common/config';
import { ScoreUtils } from './ScoreUtils';
import { AScore } from './AScore';
import { FieldUtils } from 'tdp_gene';
import { IDTypeManager } from 'tdp_core';
import { RestBaseUtils } from 'tdp_core';
import { LineupUtils } from 'tdp_core';
export class AFrequencyScore extends AScore {
    constructor(parameter, dataSource, oppositeDataSource, countOnly) {
        super(parameter);
        this.parameter = parameter;
        this.dataSource = dataSource;
        this.oppositeDataSource = oppositeDataSource;
        this.countOnly = countOnly;
    }
    get idType() {
        return IDTypeManager.getInstance().resolveIdType(this.dataSource.idType);
    }
    createDesc() {
        const ds = this.oppositeDataSource;
        const subtype = this.dataSubType;
        const isMutation = this.dataType === mutation;
        const isCopyNumberClass = this.dataSubType.id === 'copynumberclass';
        let compare = '';
        if (isCopyNumberClass) {
            compare = ` one of (${this.parameter.comparison_cn.map((d) => d.text).join(', ')})`;
        }
        else if (!isMutation) {
            compare = ` ${this.parameter.comparison_operator} ${this.parameter.comparison_value}`;
        }
        const desc = `${ds.name} Filter: ${ScoreUtils.toFilterString(this.parameter.filter, ds)}\nData Type: ${this.dataType.name}\nData Subtype: ${this.dataSubType.name}\nAggregation: ${this.countOnly ? 'Count' : 'Frequency'}${compare}`;
        return ScoreUtils.createDesc(dataSubtypes.number, `${subtype.name}${compare} ${this.countOnly ? 'Count' : 'Frequency'}`, subtype, desc);
    }
    async compute(ids, idtype, namedSet) {
        const isMutation = this.dataType === mutation;
        const isCopyNumberClass = this.dataSubType.id === 'copynumberclass';
        const param = {
            attribute: this.dataSubType.useForAggregation,
            species: SpeciesUtils.getSelectedSpecies(),
            table: this.dataType.tableName,
            target: idtype.id
        };
        if (!isMutation && !isCopyNumberClass) {
            param.operator = this.parameter.comparison_operator;
            param.value = this.parameter.comparison_value;
        }
        if (isCopyNumberClass) {
            param.value = this.parameter.comparison_value;
        }
        const maxDirectRows = typeof this.parameter.maxDirectFilterRows === 'number' ? this.parameter.maxDirectFilterRows : MAX_FILTER_SCORE_ROWS_BEFORE_ALL;
        FieldUtils.limitScoreRows(param, ids, idtype, this.dataSource.entityName, maxDirectRows, namedSet);
        const filters = Object.assign(LineupUtils.toFilter(this.parameter.filter), this.createFilter());
        const rows = await RestBaseUtils.getTDPScore(this.dataSource.db, `${this.getViewPrefix()}${this.dataSource.base}_${this.oppositeDataSource.base}_frequency_${isMutation ? 'mutation_' : ''}${isCopyNumberClass ? 'copynumberclass_' : ''}score`, param, filters);
        rows.forEach((row) => row.score = this.countOnly ? row.count : row.count / row.total);
        return rows;
    }
    createFilter() {
        return {};
    }
}
//# sourceMappingURL=AFrequencyScore.js.map