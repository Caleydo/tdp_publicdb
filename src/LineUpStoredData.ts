import {RestBaseUtils, IParams, IRow} from 'tdp_core';
import {gene} from './config';
import {IAdditionalColumnDesc} from 'tdp_core';
import {SpeciesUtils, Species} from 'tdp_gene';

/**
 * Load the column description for a given idType
 *
 * @param idType idType
 * @returns {Promise<IAdditionalColumnDesc[]>} Returns a promise with a list of column descriptions
 */
export async function loadEnsemblColumnDesc(idType: string): Promise<IAdditionalColumnDesc[]> {
  const {columns} = await RestBaseUtils.getTDPDesc(gene.db, gene.base);
  return gene.columns((c) => columns.find((d) => d.column === c));
}

/**
 * Load rows for the given idType and the selected species, which is automatically retrieved from the session.
 * The list of rows can be filtered by a given list of ids.
 *
 * @param idType idType
 * @param ids List of ids for the given idType that are used as filter; if the list is empty all available rows are loaded
 * @returns {Promise<IRow[]>} Returns a promise with a list of data rows
 */
export async function loadEnsemblRows(idType: string, ids: string[]): Promise<IRow[]> {
  const filter: IParams = {
    [Species.SPECIES_SESSION_KEY]: SpeciesUtils.getSelectedSpecies(),
    [gene.entityName]: ids
  };

  return RestBaseUtils.getTDPFilteredRows(gene.db, gene.base, {}, filter);
}
