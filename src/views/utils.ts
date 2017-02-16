/**
 * Created by sam on 16.02.2017.
 */

import {getSelectedSpecies} from 'targid_common/src/Common';
import {getAPIJSON} from 'phovea_core/src/ajax';

export function loadFirstName(ensg: string): Promise<string> {
  return getAPIJSON(`/targid/db/bioinfodb/gene_map_ensgs`, {
    ensgs: '\'' + ensg + '\'',
    species: getSelectedSpecies()
  }).then((r) => r[0].symbol);
}
