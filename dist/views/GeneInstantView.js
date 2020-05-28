/**
 * Created by Samuel Gratzl on 27.04.2016.
 */
import { resolveIds } from 'tdp_core/src/views';
import { AInstantView } from 'tdp_core/src/views/AInstantView';
import { getSelectedSpecies } from 'tdp_gene/src/common';
import { gene } from '../config';
import { getTDPFilteredRows } from 'tdp_core/src/rest';
import { errorAlert } from 'tdp_core/src/notifications';
export class GeneInstantView extends AInstantView {
    initImpl() {
        super.initImpl();
        this.build();
    }
    async loadData() {
        const ids = await resolveIds(this.selection.idtype, this.selection.range, gene.idType);
        return getTDPFilteredRows(gene.db, `${gene.base}_all_columns`, {
            species: getSelectedSpecies()
        }, { [gene.entityName]: ids });
    }
    async build() {
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
//# sourceMappingURL=GeneInstantView.js.map