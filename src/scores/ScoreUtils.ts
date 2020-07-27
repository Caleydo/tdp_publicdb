/**
 * Created by Samuel Gratzl on 27.04.2016.
 */

import {IPluginDesc} from 'phovea_core';
import {IDataSubtypeConfig, dataSubtypes, cellline, tissue, gene, IDataSourceConfig} from '../common/config';
import {FORM_GENE_FILTER, FORM_TISSUE_FILTER, FORM_CELLLINE_FILTER} from '../common/forms';
import {LineupUtils} from 'tdp_core';
import {IFormMultiMap} from 'tdp_core';


export class ScoreUtils {

  /**
   * creates a lineup config out of a IDataSubtypeConfig
   * @param type force a specific type
   * @param label the column label
   * @param subtype specific infos
   * @param description optional description of the column
   * @return {any}
   */
  static createDesc(type: string, label: string, subtype: IDataSubtypeConfig, description = ''): any {
    switch (type) {
      case dataSubtypes.cat:
        return {
          type: 'categorical',
          label,
          description,
          categories: subtype.categories,
          missingValue: subtype.missingValue,
          lazyLoaded: true
        };
      case dataSubtypes.string:
        return {
          type: 'string',
          label,
          description,
          lazyLoaded: true
        };
      case dataSubtypes.boxplot:
        return {
          type: 'boxplot',
          label,
          description,
          domain: [1, 100],
          lazyLoaded: true,
          sort: 'median', // sort by default by median
          missingValue: null
        };
      case 'numbers':
        return {
          type: 'numbers',
          label,
          description,
          domain: [1, 100],
          colorRange: ['white', 'black'],
          lazyLoaded: true,
          dataLength: 10, // initial width
          sort: 'median', // sort by default by median
          missingValue: null
        };
      default:
        return {
          type: 'number',
          label,
          description,
          domain: subtype.domain,
          missingValue: subtype.missingValue,
          lazyLoaded: true
        };
    }
  }

  private static select(idType: string) {
    return [gene, cellline, tissue].find((d) => d.idType === idType);
  }

  static selectDataSources(pluginDesc: IPluginDesc) {
    const primary = ScoreUtils.select(pluginDesc.primaryType);
    const opposite = ScoreUtils.select(pluginDesc.oppositeType);
    return {primary, opposite};
  }

  private static toFilterDesc(ds: IDataSourceConfig) {
    switch (ds) {
      case gene:
        return FORM_GENE_FILTER;
      case tissue:
        return FORM_TISSUE_FILTER;
      case cellline:
        return FORM_CELLLINE_FILTER;
    }
  }

  static toFilterString(filter: IFormMultiMap, ds: IDataSourceConfig) {
    const key2name = new Map<string, string>();

    const filterDesc = ScoreUtils.toFilterDesc(ds);
    if (filterDesc) {
      filterDesc.options.entries.forEach((entry) => {
        key2name.set(entry.value, entry.name);
      });
    }
    return LineupUtils.toFilterString(filter, key2name);
  }

}
