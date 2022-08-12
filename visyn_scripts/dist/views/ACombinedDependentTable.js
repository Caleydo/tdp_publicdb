import { ARankingView, RestBaseUtils, IDTypeManager, LineupUtils, AdapterUtils, } from 'tdp_core';
import { SpeciesUtils } from '../common';
import { ParameterFormIds, FORM_DATA_HIERARCHICAL_SUBTYPE } from '../common/forms';
import { ViewUtils } from './ViewUtils';
import { splitTypes } from '../common/config';
export class ACombinedDependentTable extends ARankingView {
    constructor(context, selection, parent, dataType, options = {}) {
        super(context, selection, parent, Object.assign(options, {
            additionalScoreParameter: () => this.oppositeDataSource,
            itemName: () => this.oppositeDataSource.name,
            enableSidePanel: 'collapsed',
            enableAddingColumnGrouping: true,
            panelAddColumnBtnOptions: {
                btnClass: 'btn-primary',
            },
            ...ViewUtils.rankingOptionsFromEnv(),
        }));
        this.dataType = dataType;
        this.dataType = dataType;
    }
    get itemIDType() {
        return IDTypeManager.getInstance().resolveIdType(this.oppositeDataSource.idType);
    }
    getParameterFormDescs() {
        return super.getParameterFormDescs().concat([
            {
                ...FORM_DATA_HIERARCHICAL_SUBTYPE,
                label: 'Data Subtype',
                attributes: {
                    style: 'width:500px',
                },
            },
        ]);
    }
    get subTypes() {
        const value = this.getParameter(ParameterFormIds.DATA_HIERARCHICAL_SUBTYPE);
        return value.map(({ id, text }) => {
            const { dataType, dataSubType } = splitTypes(id);
            return { label: text, id, dataType, dataSubType };
        });
    }
    createSelectionAdapter() {
        return AdapterUtils.multi({
            createDescs: async (id) => {
                const ids = await IDTypeManager.getInstance().mapNameToFirstName(this.selection.idtype, [id], this.dataSource.idType);
                return this.getSelectionColumnDesc(id, ids[0]);
            },
            loadData: (id, descs) => {
                return descs.map(async (desc) => {
                    // map descs here to return Promise array
                    const ids = await IDTypeManager.getInstance().mapNameToFirstName(this.selection.idtype, [id], this.dataSource.idType);
                    return this.loadSelectionColumnData(ids[0], [desc])[0]; // send single desc and pick immediately
                });
            },
            getSelectedSubTypes: () => this.subTypes.map((d) => d.id),
        });
    }
    parameterChanged(name) {
        super.parameterChanged(name);
        if (name === 'filter') {
            return this.reloadData();
        }
        return Promise.resolve();
    }
    loadColumnDesc() {
        return RestBaseUtils.getTDPDesc(this.dataSource.db, this.oppositeDataSource.base);
    }
    getColumnDescs(columns) {
        return this.oppositeDataSource.columns((c) => columns.find((d) => d.column === c));
    }
    loadRows() {
        const filter = LineupUtils.toFilter(this.getParameter('filter'));
        filter.species = SpeciesUtils.getSelectedSpecies();
        return RestBaseUtils.getTDPFilteredRows(this.dataSource.db, this.oppositeDataSource.tableName, {}, filter);
    }
    getSelectionColumnLabel(name) {
        return name;
    }
    async getSelectionColumnDesc(_id, name) {
        return Promise.resolve(this.getSelectionColumnLabel(name)).then((nlabel) => this.subTypes.map(({ label, dataSubType, id }) => {
            const clabel = `${nlabel} (${label})`;
            const desc = ViewUtils.subTypeDesc(dataSubType, _id, clabel, `col_${id}`);
            desc.selectedSubtype = id;
            return desc;
        }));
    }
    loadSelectionColumnData(name, descs) {
        const filter = LineupUtils.toFilter(this.getParameter('filter'));
        const param = {
            name,
            species: SpeciesUtils.getSelectedSpecies(),
        };
        const config = descs.map((option) => splitTypes(option.selectedSubtype));
        return config.map(({ dataType, dataSubType }) => {
            return RestBaseUtils.getTDPScore(this.dataSource.db, `${this.oppositeDataSource.base}_${this.dataSource.base}_single_score`, {
                table: dataType.tableName,
                attribute: dataSubType.id,
                ...param,
            }, filter).then(ViewUtils.postProcessScore(dataSubType));
        });
    }
}
//# sourceMappingURL=ACombinedDependentTable.js.map