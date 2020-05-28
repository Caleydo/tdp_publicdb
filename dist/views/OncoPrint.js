/**
 * Created by sam on 16.02.2017.
 */
import { AOncoPrint } from 'tdp_gene/src/views/AOncoPrint';
import { getSelectedSpecies } from 'tdp_gene/src/common';
import { ParameterFormIds, FORM_TISSUE_OR_CELLLINE_FILTER, FORM_DATA_SOURCE } from '../forms';
import { loadFirstName } from './utils';
import { resolve } from 'phovea_core/src/idtype';
import { getTDPData, getTDPFilteredRows, mergeParamAndFilters } from 'tdp_core/src/rest';
import { toFilter } from 'tdp_core/src/lineup';
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
            species: getSelectedSpecies()
        };
        const rows = await getTDPFilteredRows(ds.db, `${ds.base}_onco_print_sample_list`, param, toFilter(this.getParameter('filter')));
        return rows.map((r) => ({ name: r.id, id: r._id }));
    }
    getSampleIdType() {
        const ds = this.dataSource;
        return resolve(ds.idType);
    }
    loadRows(ensg) {
        const ds = this.dataSource;
        const param = {
            ensg,
            species: getSelectedSpecies()
        };
        return getTDPData(ds.db, `${ds.base}_onco_print`, mergeParamAndFilters(param, toFilter(this.getParameter('filter'))));
    }
    loadFirstName(ensg) {
        return loadFirstName(ensg);
    }
}
//# sourceMappingURL=OncoPrint.js.map