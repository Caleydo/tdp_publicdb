import { INamedSet, ENamedSetType } from 'tdp_core';
import { IDType } from 'visyn_core';

export class FieldUtils {
  /**
   * converts the field in the given array 2^<value>
   * @param rows
   * @param field
   * @returns {[any,any,any,any,any]}
   */
  static convertLog2ToLinear(rows: any[], field: string) {
    console.log('convert log2 score to linear scale');
    return rows.map((row) => {
      row[field] = 2 ** row[field];
      return row;
    });
  }

  /**
   * limit the number of score rows if it doesn't exceed some criteria
   */
  static limitScoreRows(param: any, ids: string[], idTypeOfIDs: IDType, entity: string, maxDirectRows: number, namedSet?: INamedSet) {
    if (ids.length < maxDirectRows) {
      param[`filter_rangeOf${idTypeOfIDs.id}4${entity}`] = ids;
      return;
    }
    if (namedSet) {
      // propagate named sets
      switch (namedSet.type) {
        case ENamedSetType.PANEL:
          param[`filter_panel_${entity}`] = namedSet.id;
          break;
        case ENamedSetType.NAMEDSET:
          param[`filter_namedset4${entity}`] = namedSet.id;
          break;
        default:
          break;
      }
    }
  }
}
