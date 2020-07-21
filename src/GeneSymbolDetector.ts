import {getTDPData} from 'tdp_core/src/rest';

/**
 * Detect gene symbols from a data array by checking the strings against the database.
 * The function returns a number between 0 and 1 defining the fraction of matching genes in the data array.
 *
 * @param data Data array with objects or strings
 * @param accessor Accessor function to retrieve a certain field from a data item
 * @param sampleSize Number of samples to test; can be used to limit iterations for large arrays
 */
async function detectIDType(data: any[], accessor: (row: any) => string, sampleSize: number): Promise<number> {
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

  const result = await getTDPData<{matches: number}>('publicdb', 'gene_match_symbols/filter', {filter_symbol: values});
  return result[0].matches / validSize;
}

export function human() {
  return {
    detectIDType
  };
}
