/**
 * Created by sam on 06.03.2017.
 */

import {IDataSubtypeConfig, dataSubtypes, cellline, tissue, gene} from '../config';
import {IBoxPlotData} from 'lineupjs/src/model/BoxPlotColumn';
import {IPluginDesc} from 'phovea_core/src/plugin';

/**
 * creates a lineup config out of a IDataSubtypeConfig
 * @param type force a specific type
 * @param label the column label
 * @param subtype specific infos
 * @return {any}
 */
export function createDesc(type: string, label: string, subtype: IDataSubtypeConfig): any {
  switch (type) {
    case dataSubtypes.cat:
      return {
        type: 'categorical',
        label,
        categories: subtype.categories,
        missingValue: subtype.missingCategory,
        lazyLoaded: true
      };
    case dataSubtypes.string:
      return {
        type: 'string',
        label,
        lazyLoaded: true
      };
    case dataSubtypes.boxplot:
      return {
        type: 'boxplot',
        label,
        domain: [1, 100],
        lazyLoaded: true,
        missingValue: <IBoxPlotData>{
          min: 0,
          max: 0,
          median: 0,
          q1: 0,
          q3: 0
        },
      };
    default:
      return {
        type: 'number',
        label,
        domain: subtype.domain,
        missingValue: subtype.missingValue,
        lazyLoaded: true
      };
  }
}

function select(idType: string) {
  return [gene, cellline, tissue].find((d) => d.idType === idType);
}

export function selectDataSources(pluginDesc: IPluginDesc) {
  const primary = select(pluginDesc.primaryType);
  const opposite = select(pluginDesc.oppositeType);
  return {primary, opposite};
}
