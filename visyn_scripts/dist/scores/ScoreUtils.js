/**
 * Created by Samuel Gratzl on 27.04.2016.
 */
import { LineupUtils } from 'tdp_core';
import { dataSubtypes, cellline, tissue, gene, drug } from '../common/config';
import { FORM_GENE_FILTER, FORM_TISSUE_FILTER, FORM_CELLLINE_FILTER } from '../common/forms';
export class ScoreUtils {
    /**
     * creates a lineup config out of a IDataSubtypeConfig
     * @param type force a specific type
     * @param label the column label
     * @param subtype specific infos
     * @param description optional description of the column
     * @return {any}
     */
    static createDesc(type, label, subtype, description = '') {
        switch (type) {
            case dataSubtypes.cat:
                return {
                    type: 'categorical',
                    label,
                    description,
                    categories: subtype.categories,
                    missingValue: subtype.missingValue,
                    lazyLoaded: true,
                };
            case dataSubtypes.string:
                return {
                    type: 'string',
                    label,
                    description,
                    lazyLoaded: true,
                };
            case dataSubtypes.boxplot:
                return {
                    type: 'boxplot',
                    label,
                    description,
                    domain: [1, 100],
                    lazyLoaded: true,
                    sort: 'median',
                    missingValue: null,
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
                    missingValue: null,
                };
            default:
                return {
                    type: 'number',
                    label,
                    description,
                    domain: subtype.domain,
                    missingValue: subtype.missingValue,
                    lazyLoaded: true,
                };
        }
    }
    static select(idType) {
        return [gene, cellline, tissue, drug].find((d) => d.idType === idType);
    }
    static selectDataSources(pluginDesc) {
        const primary = ScoreUtils.select(pluginDesc.primaryType);
        const opposite = ScoreUtils.select(pluginDesc.oppositeType);
        return { primary, opposite };
    }
    static toFilterDesc(ds) {
        switch (ds) {
            case gene:
                return FORM_GENE_FILTER;
            case tissue:
                return FORM_TISSUE_FILTER;
            case cellline:
                return FORM_CELLLINE_FILTER;
            default:
                return undefined;
        }
    }
    static toFilterString(filter, ds) {
        const key2name = new Map();
        const filterDesc = ScoreUtils.toFilterDesc(ds);
        if (filterDesc) {
            filterDesc.options.entries.forEach((entry) => {
                key2name.set(entry.value, entry.name);
            });
        }
        return LineupUtils.toFilterString(filter, key2name);
    }
}
//# sourceMappingURL=ScoreUtils.js.map