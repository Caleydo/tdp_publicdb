/**
 * Created by sam on 16.02.2017.
 */

import {getSelectedSpecies} from 'tdp_gene/src/common';
import {getTDPData} from 'tdp_core/src/rest';
import {IScoreRow} from 'tdp_core/src/extensions';
import {IDataSubtypeConfig} from '../config';
import {convertLog2ToLinear} from 'tdp_gene/src/utils';
import {categoricalCol, stringCol, numberCol} from 'tdp_core/src/lineup';

export function loadFirstName(ensg: string): Promise<string> {
  return getTDPData<any>('publicdb', 'gene_map_ensgs', {
    ensgs: '\'' + ensg + '\'',
    species: getSelectedSpecies()
  }).then((r) => r.length > 0 ? r[0].symbol || r[0].id : ensg);
}

export function loadGeneList(ensgs: string[]): Promise<{ id: string, symbol: string }[]> {
  return getTDPData('publicdb', 'gene_map_ensgs', {
    ensgs: '\'' + ensgs.join('\',\'') + '\'',
    species: getSelectedSpecies()
  });
}

export function postProcessScore(subType: IDataSubtypeConfig) {
  return (rows: IScoreRow<any>[]) => {
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

export function subTypeDesc(dataSubType: IDataSubtypeConfig, id: number, label: string, col = `col_${id}`) {
  if (dataSubType.type === 'boolean' || dataSubType.type === 'string') {
    return stringCol(col, {label, width: 50});
  } else if (dataSubType.type === 'cat') {
    return categoricalCol(col, dataSubType.categories, {label, width: 50});
  }
  return numberCol(col, dataSubType.domain[0], dataSubType.domain[1], {label, width: 50});
}
