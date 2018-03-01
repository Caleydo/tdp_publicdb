/**
 * Created by Samuel Gratzl on 27.04.2016.
 */

import {resolveIds} from 'tdp_core/src/views';
import AInstantView from 'tdp_core/src/views/AInstantView';
import {getSelectedSpecies} from 'tdp_gene/src/common';
import {gene} from '../config';
import {getTDPFilteredRows} from 'tdp_core/src/rest';
import {errorAlert} from 'tdp_core/src/notifications';

interface IGeneInfo {
  _id: number;
  id: string;
  ensg: string;
  symbol: string;
  name: string;
  biotype: string;
  species: string;
  chromosome: string;
}

export default class GeneInstantView extends AInstantView {

  protected initImpl() {
    super.initImpl();
    this.build();
  }

  private async loadData(): Promise<IGeneInfo[]> {
    const ids = await resolveIds(this.selection.idtype, this.selection.range, gene.idType);
    return <any>getTDPFilteredRows(gene.db, `${gene.base}_all_columns`, {
      species: getSelectedSpecies()
    }, {[gene.entityName] : ids});
  }

  private async build() {
    this.node.classList.add('tdp-busy');
    this.loadData().then((data) => {
      this.node.classList.remove('tdp-busy');
      const first = data[0];
      this.node.innerHTML = `
        <h4>${first.symbol} (${first.ensg})</h4>
        <p>${first.name}</p>
        <p>Location: ${first.chromosome} @ ${first.species}</p>
      `;
    }).catch(errorAlert)
      .catch(() => this.node.classList.remove('tdp-busy'));
  }
}
