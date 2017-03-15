/**
 * Created by sam on 06.03.2017.
 */

import {dataTypes, IDataTypeConfig, IDataSubtypeConfig} from '../config';

export interface IScoreFilter {
  name: string | string[]; // including named set special handling
  names: string | string[]; //name of named set with names
  panel: string | string[]; //name of the panel
  strand: string |string[];
  biotype: string|string[];
}

export interface ICommonScoreParam {
  data_type: string;
  data_subtype: string;
  filter: IScoreFilter;
}

function split(dataTypeId: string, dataSubTypeId: string) {
  const dataType = dataTypes.find((d) => d.id === dataTypeId);
  const dataSubType = dataType.dataSubtypes.find((d) => d.id === dataSubTypeId);
  return {dataType, dataSubType};
}


export default class AScore {
  protected readonly dataType: IDataTypeConfig;
  protected readonly dataSubType: IDataSubtypeConfig;

  constructor(parameter: {data_type: string, data_subtype: string}) {
    const {dataType, dataSubType} = split(parameter.data_type, parameter.data_subtype);
    this.dataType = dataType;
    this.dataSubType = dataSubType;
  }
}
