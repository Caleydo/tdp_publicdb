/**
 * Created by Marc Streit on 26.07.2016.
 */
import { IDTypeManager } from 'visyn_core/idtype';
import { ARankingView, AdapterUtils, FormElementType, RestBaseUtils, LineupUtils } from 'tdp_core';
import { ParameterFormIds, FORM_DATA_SOURCE, FORM_TISSUE_OR_CELLLINE_FILTER } from '../common/forms';
import { ViewUtils } from './ViewUtils';
import { expression, copyNumber, mutation } from '../common/config';
import { Species, SpeciesUtils } from '../common';
export class DependentSampleTable extends ARankingView {
    constructor(context, selection, parent, dataType, options = {}) {
        super(context, selection, parent, {
            additionalScoreParameter: () => this.dataSource,
            itemName: () => this.dataSource.name,
            enableAddingColumnGrouping: true,
            subType: {
                key: Species.SPECIES_SESSION_KEY,
                value: SpeciesUtils.getSelectedSpecies(),
            },
            panelAddColumnBtnOptions: {
                btnClass: 'btn-primary',
            },
            enableSidePanel: 'collapsed',
            ...ViewUtils.rankingOptionsFromEnv(),
            ...options,
        });
        this.dataType = dataType;
    }
    getParameterFormDescs() {
        return super.getParameterFormDescs().concat([
            FORM_DATA_SOURCE,
            {
                type: FormElementType.SELECT,
                label: 'Data Subtype',
                id: ParameterFormIds.DATA_SUBTYPE,
                options: {
                    optionsData: this.dataType.dataSubtypes.map((ds) => {
                        return { name: ds.name, value: ds.id, data: ds };
                    }),
                },
                useSession: true,
            },
            FORM_TISSUE_OR_CELLLINE_FILTER,
        ]);
    }
    get itemIDType() {
        return IDTypeManager.getInstance().resolveIdType(this.dataSource.idType);
    }
    get dataSource() {
        return this.getParameterData(ParameterFormIds.DATA_SOURCE);
    }
    get dataSubType() {
        return this.getParameterData(ParameterFormIds.DATA_SUBTYPE);
    }
    parameterChanged(name) {
        return this.rebuild();
    }
    loadColumnDesc() {
        const { dataSource } = this;
        return RestBaseUtils.getTDPDesc(dataSource.db, dataSource.base);
    }
    createSelectionAdapter() {
        return AdapterUtils.single({
            createDesc: (id) => ViewUtils.loadFirstName(id).then((label) => ViewUtils.subTypeDesc(this.dataSubType, id, label)),
            loadData: (id) => this.loadSelectionColumnData(id),
        });
    }
    getColumnDescs(columns) {
        return this.dataSource.columns((c) => columns.find((d) => d.column === c));
    }
    loadRows() {
        const { dataSource } = this;
        const filter = LineupUtils.toFilter(this.getParameter('filter'));
        filter.species = SpeciesUtils.getSelectedSpecies();
        return RestBaseUtils.getTDPFilteredRows(dataSource.db, dataSource.base, {}, filter);
    }
    loadSelectionColumnData(name) {
        const { dataSource } = this;
        const subType = this.dataSubType;
        const param = {
            table: this.dataType.tableName,
            attribute: subType.id,
            name,
            species: SpeciesUtils.getSelectedSpecies(),
        };
        const filter = LineupUtils.toFilter(this.getParameter('filter'));
        return RestBaseUtils.getTDPScore(dataSource.db, `${dataSource.base}_gene_single_score`, param, filter).then(ViewUtils.postProcessScore(subType));
    }
    static createExpressionDependentSampleTable(context, selection, parent, options) {
        return new DependentSampleTable(context, selection, parent, expression, options);
    }
    static createCopyNumberDependentSampleTable(context, selection, parent, options) {
        return new DependentSampleTable(context, selection, parent, copyNumber, options);
    }
    static createMutationDependentSampleTable(context, selection, parent, options) {
        return new DependentSampleTable(context, selection, parent, mutation, options);
    }
}
//# sourceMappingURL=DependentSampleTable.js.map