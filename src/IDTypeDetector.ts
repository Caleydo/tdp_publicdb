import {chooseDataSource} from './config';
import {getTDPData} from 'tdp_core/src/rest';

interface IIDTypeDetectorOptions {
  sampleType: string;
}

/**
 * Detect sample ids from a data array by checking the values against the database.
 * The function returns a number between 0 and 1 defining the fraction of matching genes in the data array.
 *
 * @param data Data array with objects or strings
 * @param accessor Accessor function to retrieve a certain field from a data item
 * @param sampleSize Number of samples to test; can be used to limit iterations for large arrays
 * @param options Options to provide the IDType
 */
async function detectIDType(data: any[], accessor: (row: any) => string, sampleSize: number, options: IIDTypeDetectorOptions): Promise<number> {
  const testSize = Math.min(data.length, sampleSize);
  if (testSize <= 0) {
    return Promise.resolve(0);
  }

  let validSize = 0;
  const values = [];
  for(let i = 0; i < testSize; ++i) {
    const v = accessor(data[i]);

    if (v == null || typeof(v) !== 'string' || v.trim().length === 0) {
      continue; //skip empty samples
    }
    values.push(v);
    ++validSize;
  }

  const ds = chooseDataSource(options);
  const result = await getTDPData<{matches: number}>(ds.db, `${ds.base}_check_ids/filter`, {
    ['filter_'+ds.entityName]: values
  });
  return result[0].matches / validSize;
}

export function create() {
  return {
    detectIDType
  };
}

