/**
 * Created by sam on 06.03.2017.
 */
import { IDTypeManager, RestBaseUtils, LineupUtils } from 'tdp_core';
import { ScoreUtils } from './ScoreUtils';
import { AScore } from './AScore';
import { dataSubtypes, MAX_FILTER_SCORE_ROWS_BEFORE_ALL } from '../common/config';
import { FieldUtils } from '../providers';
import { SpeciesUtils } from '../common';
/**
 * by convention the 'panel' filter key refers to the panel used for the returning entity, e.g. a list of genes will be returned -> panel = gene panel
 * however, in the score case panel would refer to sample, while the form itself is fixed for old provenance graph this method is needed
 * @param {IParams} filter
 * @param {string} oppositeEntityName
 */
function compatibilityFilter(filter, oppositeEntityName) {
    if (!filter.hasOwnProperty('panel')) {
        return filter;
    }
    const old = filter.panel;
    delete filter.panel;
    filter[`panel_${oppositeEntityName}`] = old;
    return filter;
}
export class AAggregatedScore extends AScore {
    constructor(parameter, dataSource, oppositeDataSource) {
        super(parameter);
        this.parameter = parameter;
        this.dataSource = dataSource;
        this.oppositeDataSource = oppositeDataSource;
    }
    get idType() {
        return IDTypeManager.getInstance().resolveIdType(this.dataSource.idType);
    }
    createDesc() {
        const ds = this.oppositeDataSource;
        const desc = `${ds.name} Filter: ${ScoreUtils.toFilterString(this.parameter.filter, ds)}\nData Type: ${this.dataType.name}\nData Subtype: ${this.dataSubType.name}\nAggregation: ${this.parameter.aggregation}`;
        if (this.parameter.aggregation === 'boxplot' || this.parameter.aggregation === 'numbers') {
            return ScoreUtils.createDesc(this.parameter.aggregation, this.dataSubType.name, this.dataSubType, desc);
        }
        return ScoreUtils.createDesc(dataSubtypes.number, `${this.parameter.aggregation} ${this.dataSubType.name}`, this.dataSubType, desc);
    }
    async compute(ids, idtype, namedSet) {
        const param = {
            table: this.dataType.tableName,
            // by convention for the aggregation to do its magic, it has to be called `data_subtype`
            data_subtype: this.dataSubType.useForAggregation,
            agg: this.parameter.aggregation,
            species: SpeciesUtils.getSelectedSpecies(),
            target: idtype.id,
        };
        const maxDirectRows = typeof this.parameter.maxDirectFilterRows === 'number' ? this.parameter.maxDirectFilterRows : MAX_FILTER_SCORE_ROWS_BEFORE_ALL;
        FieldUtils.limitScoreRows(param, ids, idtype, this.dataSource.entityName, maxDirectRows, namedSet);
        const filters = Object.assign(compatibilityFilter(LineupUtils.toFilter(this.parameter.filter), this.oppositeDataSource.entityName), this.createFilter());
        let rows = await RestBaseUtils.getTDPScore(this.dataSource.db, `${this.getViewPrefix()}${this.dataSource.base}_${this.oppositeDataSource.base}_score`, param, filters);
        if (this.parameter.aggregation === 'numbers') {
            // we got a dict to consider missing values property
            rows = rows.filter((d) => d.score !== null);
            // collect all keys
            const keys = new Set();
            rows.forEach((row) => {
                Object.keys(row.score).forEach((k) => keys.add(k));
            });
            const columns = Array.from(keys).sort();
            // create an array with missing entries
            rows.forEach((row) => {
                row.score = columns.map((c) => (row.score.hasOwnProperty(c) ? row.score[c] : NaN));
            });
            // hack in the _columns
            rows._columns = columns;
        }
        if (this.dataSubType.useForAggregation.indexOf('log2') !== -1) {
            return FieldUtils.convertLog2ToLinear(rows, 'score');
        }
        return rows;
    }
    createFilter() {
        return {};
    }
}
//# sourceMappingURL=AAggregatedScore.js.map