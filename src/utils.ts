/**
 * Created by sam on 06.03.2017.
 */

export function convertLog2ToLinear(rows: any[], field: string) {
  console.log('convert log2 score to linear scale');
  return rows.map((row) => {
    row[field] = Math.pow(2, row[field]);
    return row;
  });
}

export function toFilter(param: any, filter: any) {
  // `names` is an alias for `name` and should be merged together
  if (filter.names) {
    const names = filter.names;
    delete filter.names;
    const existing = filter.name;
    if (!existing) {
      filter.name = names;
    } else {
      filter.name = [].concat(filter.name, names);
    }
  }

  // TODO handle panels!

  Object.keys(filter).forEach((k) => {
    const v = filter[k];
    param['filter_' + k] = filter[k];
  });
}
