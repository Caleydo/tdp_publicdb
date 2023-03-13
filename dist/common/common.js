/**
 * Created by Samuel Gratzl on 11.05.2016.
 */
import { UserSession, IDTypeManager } from 'visyn_core';
import { Categories } from './Categories';
// eslint-disable-next-line @typescript-eslint/no-namespace
export var Species;
(function (Species) {
    Species.availableSpecies = [
        { name: 'Human', value: 'human', iconClass: 'fa-male' },
        // { name: 'Rat', value: 'rat' },
        { name: 'Mouse', value: 'mouse', iconClass: 'mouse-icon' },
    ];
    Species.defaultSpecies = Species.availableSpecies[0].value;
    Species.DEFAULT_ENTITY_TYPE = Categories.GENE_IDTYPE;
    Species.SPECIES_SESSION_KEY = 'species';
})(Species || (Species = {}));
export class SpeciesUtils {
    static getSelectedSpecies() {
        return UserSession.getInstance().retrieve(Species.SPECIES_SESSION_KEY, Species.defaultSpecies);
    }
    /**
     * selects a human readable idtype for a given one that can be mapped
     * @param idType
     * @returns {Promise<any>}
     */
    static async selectReadableIDType(idType) {
        if (idType.id === Categories.GENE_IDTYPE) {
            const targetMapping = 'GeneSymbol';
            const species = SpeciesUtils.getSelectedSpecies();
            const mapsTo = await IDTypeManager.getInstance().getCanBeMappedTo(idType);
            let target = mapsTo.find((d) => d.name === `${targetMapping}_${species}`);
            if (!target) {
                target = mapsTo.find((d) => d.name === targetMapping);
            }
            return target;
        }
        // TODO is there a nicer name for cell lines?
        return null;
    }
    static mapToId(selection, target = null) {
        if (target === null || selection.idtype.id === target.id) {
            return selection.ids;
        }
        // assume mappable
        return IDTypeManager.getInstance().mapNameToFirstName(selection.idtype, selection.ids, target);
    }
    static createOptions(ensgs, selection, base) {
        if (ensgs === null || ensgs.length === 0 || selection.ids?.length === 0) {
            return Promise.resolve([]);
        }
        return Promise.all([SpeciesUtils.mapToId(selection, base), SpeciesUtils.selectReadableIDType(base)]).then((results) => {
            const ids = results[0];
            const target = results[1];
            if (!target) {
                return ensgs.map((ensg) => ({ value: ensg, name: ensg, data: [ensg, ensg] }));
            }
            // map and use names
            return IDTypeManager.getInstance()
                .mapNameToFirstName(base, ids, target)
                .then((names) => {
                return names.map((name, i) => ({
                    value: ensgs[i],
                    name: name ? `${name} (${ensgs[i]})` : ensgs[i],
                    data: [ensgs[i], name],
                }));
            });
        });
    }
    /**
     * Creates a converter to use GeneSymbols, translate them to Ensembl IDs, add these IDs and change the previously detected options (e.g. add a new header, change IDType, ...)
     */
    static convertGeneSymbolToEnsembl() {
        return {
            process: async function process(importResults, data) {
                if (importResults.idType.includes('GeneSymbol')) {
                    const idType = IDTypeManager.getInstance().resolveIdType(importResults.idType);
                    const geneSymbols = data.map((row) => row[importResults.idColumn]);
                    const ensgs = await IDTypeManager.getInstance().mapNameToName(idType, geneSymbols, Categories.GENE_IDTYPE);
                    // append converted ENSGs to each row
                    // ensgs is an Array of Arrays
                    // if a 1:1 mapping is found, only 1 row is added
                    // if a 1:n mapping is found, multiple rows are added with different Ensembl IDs
                    const newData = [];
                    data.forEach((row, i) => {
                        if (ensgs[i] && ensgs[i].length > 0) {
                            ensgs[i].forEach((mapping) => {
                                newData.push([...row, mapping]);
                            });
                        }
                        else {
                            newData.push([...row, '']);
                        }
                    });
                    // TODO: return newConfig instead of changing it by reference?
                    const newConfig = importResults;
                    delete newConfig.columns[newConfig.idColumn].idType;
                    // add new column header
                    newConfig.columns.push({
                        color: '#DDDDDD',
                        column: newConfig.columns.length,
                        idType: Categories.GENE_IDTYPE,
                        label: Categories.GENE_IDTYPE,
                        type: 'string',
                    });
                    newConfig.idType = Categories.GENE_IDTYPE;
                    newConfig.idColumn = newConfig.columns.length - 1;
                    newConfig.notes.push('The column Ensembl was added based on the detected Gene Symbols. 1:n mappings between Gene Symbols and Ensembl IDs were resolved by showing all possible combinations.');
                    return newData;
                }
                return data;
            },
        };
    }
    /**
     * Filters elements containing the selected species from the given data array by using the provided accessor function
     * @param filter Object
     * @returns Boolean
     */
    static filterSpecies(filter) {
        return !filter.species || filter.species === SpeciesUtils.getSelectedSpecies();
    }
}
//# sourceMappingURL=common.js.map