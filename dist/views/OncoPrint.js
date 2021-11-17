/**
 * Created by sam on 16.02.2017.
 */
import { RestBaseUtils, LineupUtils } from 'tdp_core';
import { AOncoPrint } from 'tdp_gene';
import { SpeciesUtils } from 'tdp_gene';
import { ParameterFormIds, FORM_TISSUE_OR_CELLLINE_FILTER, FORM_DATA_SOURCE } from '../common/forms';
import { ViewUtils } from './ViewUtils';
import { IDTypeManager } from 'tdp_core';
export class OncoPrint extends AOncoPrint {
    getParameterFormDescs() {
        return [
            FORM_DATA_SOURCE,
            FORM_TISSUE_OR_CELLLINE_FILTER
        ];
    }
    get dataSource() {
        return this.getParameterData(ParameterFormIds.DATA_SOURCE);
    }
    async loadSampleList() {
        const ds = this.dataSource;
        const param = {
            species: SpeciesUtils.getSelectedSpecies()
        };
        const rows = await RestBaseUtils.getTDPFilteredRows(ds.db, `${ds.base}_onco_print_sample_list`, param, LineupUtils.toFilter(this.getParameter('filter')));
        return rows.map((r) => ({ name: r.id, id: r._id }));
    }
    getSampleIdType() {
        const ds = this.dataSource;
        return IDTypeManager.getInstance().resolveIdType(ds.idType);
    }
    loadRows(ensg) {
        const ds = this.dataSource;
        const param = {
            ensg,
            species: SpeciesUtils.getSelectedSpecies()
        };
        return RestBaseUtils.getTDPData(ds.db, `${ds.base}_onco_print`, RestBaseUtils.mergeParamAndFilters(param, LineupUtils.toFilter(this.getParameter('filter'))));
    }
    loadFirstName(ensg) {
        return ViewUtils.loadFirstName(ensg);
    }
}
//# sourceMappingURL=OncoPrint.js.map