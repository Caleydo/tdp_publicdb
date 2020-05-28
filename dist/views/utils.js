/**
 * Created by sam on 16.02.2017.
 */
import { getSelectedSpecies } from 'tdp_gene/src/common';
import { getTDPData } from 'tdp_core/src/rest';
import { convertLog2ToLinear } from 'tdp_gene/src/utils';
import { categoricalCol, stringCol, numberCol } from 'tdp_core/src/lineup';
export function loadFirstName(ensg) {
    return getTDPData('publicdb', 'gene_map_ensgs', {
        ensgs: '\'' + ensg + '\'',
        species: getSelectedSpecies()
    }).then((r) => r.length > 0 ? r[0].symbol || r[0].id : ensg);
}
export function loadGeneList(ensgs) {
    return getTDPData('publicdb', 'gene_map_ensgs', {
        ensgs: '\'' + ensgs.join('\',\'') + '\'',
        species: getSelectedSpecies()
    });
}
export function postProcessScore(subType) {
    return (rows) => {
        if (subType.useForAggregation.indexOf('log2') !== -1) {
            return convertLog2ToLinear(rows, 'score');
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
        return stringCol(col, { label });
    }
    else if (dataSubType.type === 'cat') {
        return categoricalCol(col, dataSubType.categories, { label });
    }
    return numberCol(col, dataSubType.domain[0], dataSubType.domain[1], { label });
}
//# sourceMappingURL=utils.js.map