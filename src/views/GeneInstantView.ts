/**
 * Created by Samuel Gratzl on 27.04.2016.
 */

import {ResolveUtils} from 'tdp_core';
import {AInstantView} from 'tdp_core';
import {SpeciesUtils} from 'tdp_gene';
import {gene} from '../common/config';
import {RestBaseUtils} from 'tdp_core';
import {ErrorAlertHandler} from 'tdp_core';

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

export class GeneInstantView extends AInstantView {

  protected initImpl() {
    super.initImpl();
    this.build();
  }

  private async loadData(): Promise<IGeneInfo[]> {
    const ids = await ResolveUtils.resolveIds(this.selection.idtype, this.selection.range, gene.idType);
    return <any>RestBaseUtils.getTDPFilteredRows(gene.db, `${gene.base}_all_columns`, {
      species: SpeciesUtils.getSelectedSpecies()
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
    }).catch(ErrorAlertHandler.getInstance().errorAlert)
      .catch(() => this.node.classList.remove('tdp-busy'));
  }
}
