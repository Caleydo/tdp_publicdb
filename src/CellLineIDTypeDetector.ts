import {getAPIJSON, api2absURL} from 'phovea_core/src/ajax';
import {IIDTypeDetector} from 'ordino/src/GeneIDTypeDetector';

async function detectIDType(data: any[], accessor: (row: any) => string, sampleSize: number) : Promise<number> {
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
  const param = {
    entity_name: 'celllinename',
    schema: 'cellline',
    table_name: 'cellline',
    query: `'${values.join('\',\'')}'`
  };

  const result = await getAPIJSON('/targid/db/bioinfodb/check_id_types', param);
  return result[0].matches / validSize;
}

export function cellLineIDTypeDetector(): IIDTypeDetector {
  return {
    detectIDType
  };
}

