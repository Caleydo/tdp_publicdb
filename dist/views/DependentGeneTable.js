/**
 * Created by Marc Streit on 28.07.2016.
 */
import { ARankingView, AdapterUtils } from 'tdp_core';
import { SpeciesUtils, Species } from 'tdp_gene';
import { gene, expression, copyNumber, mutation, chooseDataSource } from '../common/config';
import { ParameterFormIds, FORM_GENE_FILTER } from '../common/forms';
import { FormElementType } from 'tdp_core';
import { ResolveUtils } from 'tdp_core';
import { RestBaseUtils } from 'tdp_core';
import { ViewUtils } from './ViewUtils';
import { LineupUtils } from 'tdp_core';
export class DependentGeneTable extends ARankingView {
    constructor(context, selection, parent, dataType, options = {}) {
        super(context, selection, parent, Object.assign({
            additionalScoreParameter: gene,
            itemName: gene.name,
            itemIDType: gene.idType,
            subType: {
                key: Species.SPECIES_SESSION_KEY,
                value: SpeciesUtils.getSelectedSpecies()
            },
            enableAddingColumnGrouping: true,
            panelAddColumnBtnOptions: {
                btnClass: 'btn-primary'
            }
        }, Object.assign(options, { enableSidePanel: 'collapsed' })));
        this.dataType = dataType;
        this.dataSource = chooseDataSource(context.desc);
    }
    getParameterFormDescs() {
        const parentTestId = `${this.context.desc.id}_parameter`;
        return super.getParameterFormDescs().concat([
            {
                type: FormElementType.SELECT,
                label: 'Data Subtype',
                id: ParameterFormIds.DATA_SUBTYPE,
                testid: `parameter-form_${ParameterFormIds.DATA_SUBTYPE}`,
                options: {
                    optionsData: this.dataType.dataSubtypes.map((ds) => {
                        return { name: ds.name, value: ds.id, data: ds };
                    })
                },
                useSession: true
            },
            Object.assign(FORM_GENE_FILTER, { testid: parentTestId })
        ]);
    }
    parameterChanged(name) {
        return this.rebuild();
    }
    loadColumnDesc() {
        return RestBaseUtils.getTDPDesc(gene.db, gene.base);
    }
    createSelectionAdapter() {
        return AdapterUtils.single({
            createDesc: async (_id, id) => {
                const ids = await ResolveUtils.resolveIds(this.selection.idtype, [_id], this.dataSource.idType);
                return ViewUtils.subTypeDesc(this.dataSubType, _id, ids[0]);
            },
            loadData: async (_id, id) => {
                const ids = await ResolveUtils.resolveIds(this.selection.idtype, [_id], this.dataSource.idType);
                return this.loadSelectionColumnData(ids[0]);
            }
        });
    }
    getColumnDescs(columns) {
        return gene.columns((c) => columns.find((d) => d.column === c));
    }
    loadRows() {
        const filter = LineupUtils.toFilter(this.getParameter('filter'));
        filter.species = SpeciesUtils.getSelectedSpecies();
        return RestBaseUtils.getTDPFilteredRows(gene.db, gene.base, {}, filter);
    }
    get dataSubType() {
        return this.getParameterData(ParameterFormIds.DATA_SUBTYPE);
    }
    loadSelectionColumnData(name) {
        const subType = this.dataSubType;
        const param = {
            table: this.dataType.tableName,
            attribute: subType.id,
            name,
            species: SpeciesUtils.getSelectedSpecies()
        };
        const filter = LineupUtils.toFilter(this.getParameter('filter'));
        return RestBaseUtils.getTDPScore(gene.db, `gene_${this.dataSource.base}_single_score`, param, filter).then(ViewUtils.postProcessScore(subType));
    }
    static createExpressionDependentGeneTable(context, selection, parent, options) {
        return new DependentGeneTable(context, selection, parent, expression, options);
    }
    static createCopyNumberDependentGeneTable(context, selection, parent, options) {
        return new DependentGeneTable(context, selection, parent, copyNumber, options);
    }
    static createMutationDependentGeneTable(context, selection, parent, options) {
        return new DependentGeneTable(context, selection, parent, mutation, options);
    }
}
//# sourceMappingURL=DependentGeneTable.js.map