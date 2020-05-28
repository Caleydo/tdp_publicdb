/**
 * Created by sam on 16.02.2017.
 */
import { SpeciesUtils } from 'tdp_gene';
import { RestBaseUtils } from 'tdp_core';
import { FieldUtils } from 'tdp_gene';
import { ColumnDescUtils } from 'tdp_core';
export function loadFirstName(ensg) {
    return RestBaseUtils.getTDPData('publicdb', 'gene_map_ensgs', {
        ensgs: '\'' + ensg + '\'',
        species: SpeciesUtils.getSelectedSpecies()
    }).then((r) => r.length > 0 ? r[0].symbol || r[0].id : ensg);
}
export function loadGeneList(ensgs) {
    return RestBaseUtils.getTDPData('publicdb', 'gene_map_ensgs', {
        ensgs: '\'' + ensgs.join('\',\'') + '\'',
        species: SpeciesUtils.getSelectedSpecies()
    });
}
export function postProcessScore(subType) {
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
export function subTypeDesc(dataSubType, id, label, col = `col_${id}`) {
    if (dataSubType.type === 'boolean' || dataSubType.type === 'string') {
        return ColumnDescUtils.stringCol(col, { label });
    }
    else if (dataSubType.type === 'cat') {
        return ColumnDescUtils.categoricalCol(col, dataSubType.categories, { label });
    }
    return ColumnDescUtils.numberCol(col, dataSubType.domain[0], dataSubType.domain[1], { label });
}
//# sourceMappingURL=utils.js.map