/**
 * Created by sam on 16.02.2017.
 */

import {getSelectedSpecies} from 'tdp_gene/src/common';
import {getTDPData} from 'tdp_core/src/rest';

export function loadFirstName(ensg: string): Promise<string> {
  return getTDPData<any>('publicdb', 'gene_map_ensgs', {
    ensgs: '\'' + ensg + '\'',
    species: getSelectedSpecies()
  }).then((r) => r.length > 0 ? r[0].symbol || r[0].id : ensg);
}

export function loadGeneList(ensgs: string[]): Promise<{id: string, symbol: string}[]> {
   return getTDPData('publicdb', 'gene_map_ensgs', {
      ensgs: '\'' + ensgs.join('\',\'') + '\'',
      species: getSelectedSpecies()
    });
}
