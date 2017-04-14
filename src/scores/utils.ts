/**
 * Created by sam on 06.03.2017.
 */

import {IDataSubtypeConfig, dataSubtypes, cellline, tissue, gene, IDataSourceConfig} from '../config';
import {IBoxPlotData} from 'lineupjs/src/model/BoxPlotColumn';
import {IPluginDesc} from 'phovea_core/src/plugin';
import {FORM_GENE_FILTER, FORM_TISSUE_FILTER, FORM_CELLLINE_FILTER} from '../forms';

/**
 * creates a lineup config out of a IDataSubtypeConfig
 * @param type force a specific type
 * @param label the column label
 * @param subtype specific infos
 * @return {any}
 */
export function createDesc(type: string, label: string, subtype: IDataSubtypeConfig, description = ''): any {
  switch (type) {
    case dataSubtypes.cat:
      return {
        type: 'categorical',
        label,
        description,
        categories: subtype.categories,
        missingValue: subtype.missingCategory,
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
        description,
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

function toFilterDesc(ds: IDataSourceConfig) {
  switch (ds) {
    case gene:
      return FORM_GENE_FILTER;
    case tissue:
      return FORM_TISSUE_FILTER;
    case cellline:
      return FORM_CELLLINE_FILTER;
  }
}

export function toFilterString(filter: any, ds: IDataSourceConfig) {
  const key2name = new Map<string,string>();

  const filterDesc = toFilterDesc(ds);
  if (filterDesc) {
    filterDesc.options.entries.forEach((entry) => {
      key2name.set(entry.value, entry.name);
    });
  }
  return Object.keys(filter).map((d) => {
    const v = filter[d];
    const label = key2name.has(d) ? key2name.get(d) : d;
    const vn = Array.isArray(v) ? '["' + v.join('","') + '"]' : '"' + v.toString() + '"';
    return `${label}=${vn}`;
  }).join(', ');
}
