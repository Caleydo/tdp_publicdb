/**
 * Created by sam on 16.02.2017.
 */

import {SpeciesUtils} from 'tdp_gene';
import {RestBaseUtils} from 'tdp_core';
import {IScoreRow} from 'tdp_core';
import {IDataSubtypeConfig} from '../config';
import {FieldUtils} from 'tdp_gene';
import {ColumnDescUtils} from 'tdp_core';

export function loadFirstName(ensg: string): Promise<string> {
  return RestBaseUtils.getTDPData<any>('publicdb', 'gene_map_ensgs', {
    ensgs: '\'' + ensg + '\'',
    species: SpeciesUtils.getSelectedSpecies()
  }).then((r) => r.length > 0 ? r[0].symbol || r[0].id : ensg);
}

export function loadGeneList(ensgs: string[]): Promise<{ id: string, symbol: string, _id: number }[]> {
  return RestBaseUtils.getTDPData('publicdb', 'gene_map_ensgs', {
    ensgs: '\'' + ensgs.join('\',\'') + '\'',
    species: SpeciesUtils.getSelectedSpecies()
  });
}

export function postProcessScore(subType: IDataSubtypeConfig) {
  return (rows: IScoreRow<any>[]) => {
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

export function subTypeDesc(dataSubType: IDataSubtypeConfig, id: number, label: string, col = `col_${id}`) {
  if (dataSubType.type === 'boolean' || dataSubType.type === 'string') {
    return ColumnDescUtils.stringCol(col, {label});
  } else if (dataSubType.type === 'cat') {
    return ColumnDescUtils.categoricalCol(col, dataSubType.categories, {label});
  }
  return ColumnDescUtils.numberCol(col, dataSubType.domain[0], dataSubType.domain[1], {label});
}
