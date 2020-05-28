/**
 * Created by sam on 06.03.2017.
 */
import { dataSubtypes, cellline, tissue, gene } from '../common/config';
import { FORM_GENE_FILTER, FORM_TISSUE_FILTER, FORM_CELLLINE_FILTER } from '../common/forms';
import { LineupUtils } from 'tdp_core';
/**
 * creates a lineup config out of a IDataSubtypeConfig
 * @param type force a specific type
 * @param label the column label
 * @param subtype specific infos
 * @param description optional description of the column
 * @return {any}
 */
export function createDesc(type, label, subtype, description = '') {
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
                sort: 'median',
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
                dataLength: 10,
                sort: 'median',
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
function select(idType) {
    return [gene, cellline, tissue].find((d) => d.idType === idType);
}
export function selectDataSources(pluginDesc) {
    const primary = select(pluginDesc.primaryType);
    const opposite = select(pluginDesc.oppositeType);
    return { primary, opposite };
}
function toFilterDesc(ds) {
    switch (ds) {
        case gene:
            return FORM_GENE_FILTER;
        case tissue:
            return FORM_TISSUE_FILTER;
        case cellline:
            return FORM_CELLLINE_FILTER;
    }
}
export function toFilterString(filter, ds) {
    const key2name = new Map();
    const filterDesc = toFilterDesc(ds);
    if (filterDesc) {
        filterDesc.options.entries.forEach((entry) => {
            key2name.set(entry.value, entry.name);
        });
    }
    return LineupUtils.toFilterString(filter, key2name);
}
//# sourceMappingURL=utils.js.map