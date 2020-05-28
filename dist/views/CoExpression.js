/**
 * Created by sam on 16.02.2017.
 */
import { FormElementType } from 'tdp_core/src/form';
import { ACoExpression } from 'tdp_gene/src/views/ACoExpression';
import { getSelectedSpecies } from 'tdp_gene/src/common';
import { expression } from '../config';
import { ParameterFormIds, FORM_TISSUE_OR_CELLLINE_FILTER, FORM_DATA_SOURCE, FORM_COLOR_CODING } from '../forms';
import { loadGeneList, loadFirstName } from './utils';
import { resolve } from 'phovea_core/src/idtype/manager';
import { getTDPData, mergeParamAndFilters } from 'tdp_core/src/rest';
import { toFilter } from 'tdp_core/src/lineup';
export class CoExpression extends ACoExpression {
    getParameterFormDescs() {
        const base = super.getParameterFormDescs();
        base.splice(1, 0, FORM_DATA_SOURCE);
        base.push({
            type: FormElementType.SELECT,
            label: 'Expression',
            id: ParameterFormIds.EXPRESSION_SUBTYPE,
            options: {
                optionsData: expression.dataSubtypes.map((ds) => {
                    return { name: ds.name, value: ds.name, data: ds };
                })
            },
            useSession: false
        }, FORM_COLOR_CODING, FORM_TISSUE_OR_CELLLINE_FILTER);
        return base;
    }
    get dataSource() {
        return this.getParameterData(ParameterFormIds.DATA_SOURCE);
    }
    get dataSubType() {
        return this.getParameterData(ParameterFormIds.EXPRESSION_SUBTYPE);
    }
    loadGeneList(ensgs) {
        return loadGeneList(ensgs);
    }
    loadData(ensg) {
        const ds = this.dataSource;
        const param = {
            ensg,
            attribute: this.dataSubType.id,
            species: getSelectedSpecies()
        };
        const color = this.getParameterData(ParameterFormIds.COLOR_CODING);
        if (color) {
            param.color = color;
        }
        return getTDPData(ds.db, `${ds.base}_co_expression${!color ? '_plain' : ''}/filter`, mergeParamAndFilters(param, toFilter(this.getParameter('filter'))));
    }
    loadFirstName(ensg) {
        return loadFirstName(ensg);
    }
    getAttributeName() {
        return this.dataSubType.name;
    }
    get itemIDType() {
        return resolve(this.dataSource.idType);
    }
    select(range) {
        this.setItemSelection({
            idtype: this.itemIDType,
            range
        });
    }
    getNoDataErrorMessage(refGene) {
        const dataSource = this.dataSource.name;
        return `No data for the selected reference gene ${refGene.data.symbol} (${refGene.data.id}) and data source ${dataSource} available.`;
    }
}
//# sourceMappingURL=CoExpression.js.map