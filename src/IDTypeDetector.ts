import {getAPIJSON} from 'phovea_core/src/ajax';

interface IIDTypeDetectorOptions {
  entity_name: string;
  schema: string;
  table_name: string;
  query?: string;
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

  const param: IIDTypeDetectorOptions = {
    entity_name: options.entity_name,
    schema: options.schema,
    table_name: options.table_name,
    query: `'${values.join('\',\'')}'`
  };

  const result = await getAPIJSON('/targid/db/bioinfodb/check_id_types', param);
  return result[0].matches / validSize;
}

export function create() {
  return {
    detectIDType
  };
}

