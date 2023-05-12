import { IDTypeManager } from 'visyn_core/idtype';
import { AInstantView, RestBaseUtils, ErrorAlertHandler } from 'tdp_core';
import { SpeciesUtils } from '../common';
import { gene } from '../common/config';
export class GeneInstantView extends AInstantView {
    initImpl() {
        super.initImpl();
        this.build();
    }
    async loadData() {
        const ids = await IDTypeManager.getInstance().mapNameToFirstName(this.selection.idtype, this.selection.ids, gene.idType);
        return RestBaseUtils.getTDPFilteredRows(gene.db, `${gene.base}_all_columns`, {
            species: SpeciesUtils.getSelectedSpecies(),
        }, { [gene.entityName]: ids });
    }
    async build() {
        this.node.classList.add('tdp-busy');
        this.loadData()
            .then((data) => {
            this.node.classList.remove('tdp-busy');
            const first = data[0];
            this.node.innerHTML = `
        <h4>${first.symbol} (${first.ensg})</h4>
        <p>${first.name}</p>
        <p>Location: ${first.chromosome} @ ${first.species}</p>
      `;
        })
            .catch(ErrorAlertHandler.getInstance().errorAlert)
            .catch(() => this.node.classList.remove('tdp-busy'));
    }
}
//# sourceMappingURL=GeneInstantView.js.map