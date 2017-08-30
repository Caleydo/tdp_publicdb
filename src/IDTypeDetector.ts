import {chooseDataSource} from './config';
import {getTDPData} from 'tdp_core/src/rest';

interface IIDTypeDetectorOptions {
  sampleType: string;
}

async function detectIDType(data: any[], accessor: (row: any) => string, sampleSize: number, options: IIDTypeDetectorOptions) : Promise<number> {
  const testSize = Math.min(data.length, sampleSize);
  if (testSize <= 0) {
    return Promise.resolve(0);
  }

  let validSize = 0;
  const values = [];
  for(let i = 0; i < testSize; ++i) {
    const v = accessor(data[i]);

    if (v == null || v.trim().length === 0) {
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

