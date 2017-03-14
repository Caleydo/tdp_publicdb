/**
 * Created by sam on 06.03.2017.
 */

import {IDataSubtypeConfig} from '../../config';

export interface IScoreFilter {
  name: string | string[]; // including named set special handling
  panel: string | string[]; //ids
  strand: string |string[];
  biotype: string|string[];
}

export interface ICommonScoreParam {
  filter: IScoreFilter;
}
export default ICommonScoreParam;
