import {IDataSourceConfig, MAX_FILTER_SCORE_ROWS_BEFORE_ALL} from './config';
import {RangeLike, parse} from 'phovea_core/src/range';
import {INamedSet, ENamedSetType} from 'ordino/src/storage';
export {toFilter, convertLog2ToLinear, previewFilterHint} from 'targid_common/src/utils';
/**
 * Created by sam on 06.03.2017.
 */

/**
 * limit the number of score rows if it doesn't exceed some criteria
 * @param param
 * @param ids
 * @param dataSource
 */
export function limitScoreRows(param: any, ids: RangeLike, dataSource: IDataSourceConfig, namedSet?: INamedSet) {
  const range = parse(ids);
  if (range.dim(0).length < MAX_FILTER_SCORE_ROWS_BEFORE_ALL) {
    param[`filter_rangeOf${dataSource.idType}4${dataSource.entityName}`] = range.toString();
    return;
  }
  if (namedSet) {
    // propagate named sets
    switch(namedSet.type) {
      case ENamedSetType.PANEL:
        param[`filter_panel_${dataSource.entityName}`] = namedSet.id;
        break;
      case ENamedSetType.NAMEDSET:
        param[`filter_namedset4${dataSource.entityName}`] = namedSet.id;
        break;
    }
  }
}
