import {RestBaseUtils} from 'tdp_core';


export class GeneSymbolDetector {
  static async detectIDType(data: any[], accessor: (row: any) => string, sampleSize: number) {
    const values = [];
    let validSize = 0;
    for(let i = 0; i < sampleSize; ++i) {
      const v = accessor(data[i]);
      if (v == null || typeof(v) !== 'string' || v.trim().length === 0) {
        continue; //skip empty samples
      }
      values.push(v);
      ++validSize;
    }
    const result = await RestBaseUtils.getTDPData<{matches: number}>('publicdb', 'gene_match_symbols/filter', {filter_symbol: values});
    return result[0].matches / validSize;
  }

  static human() {
    return {
      detectIDType: GeneSymbolDetector.detectIDType
    };
  }
}

