import { resolveIds } from 'tdp_core/src/views';
import { getSelectedSpecies } from 'tdp_gene/src/common';
import { splitTypes } from '../config';
import { ParameterFormIds, FORM_DATA_HIERARCHICAL_SUBTYPE } from '../forms';
import { ARankingView, multi } from 'tdp_core/src/lineup';
import { getTDPDesc, getTDPFilteredRows, getTDPScore } from 'tdp_core/src/rest';
import { postProcessScore, subTypeDesc } from './utils';
import { resolve } from 'phovea_core/src/idtype';
import { toFilter } from 'tdp_core/src/lineup';
export class ACombinedDependentTable extends ARankingView {
    constructor(context, selection, parent, dataType, options = {}) {
        super(context, selection, parent, Object.assign(options, {
            additionalScoreParameter: () => this.oppositeDataSource,
            itemName: () => this.oppositeDataSource.name,
            enableSidePanel: 'collapsed',
            enableAddingColumnGrouping: true
        }));
        this.dataType = dataType;
        this.dataType = dataType;
    }
    get itemIDType() {
        return resolve(this.oppositeDataSource.idType);
    }
    getParameterFormDescs() {
        return super.getParameterFormDescs().concat([
            Object.assign({}, FORM_DATA_HIERARCHICAL_SUBTYPE, {
                label: 'Data Subtype',
                attributes: {
                    style: 'width:500px'
                }
            })
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
        return multi({
            createDescs: async (_id, id) => {
                const ids = await resolveIds(this.selection.idtype, [_id], this.dataSource.idType);
                return this.getSelectionColumnDesc(_id, ids[0]);
            },
            loadData: (_id, id, descs) => {
                return descs.map(async (desc) => {
                    const ids = await resolveIds(this.selection.idtype, [_id], this.dataSource.idType);
                    return this.loadSelectionColumnData(ids[0], [desc])[0]; // send single desc and pick immediately
                });
            },
            getSelectedSubTypes: () => this.subTypes.map((d) => d.id)
        });
    }
    parameterChanged(name) {
        super.parameterChanged(name);
        if (name === 'filter') {
            this.reloadData();
        }
    }
    loadColumnDesc() {
        return getTDPDesc(this.dataSource.db, this.oppositeDataSource.base);
    }
    getColumnDescs(columns) {
        return this.oppositeDataSource.columns((c) => columns.find((d) => d.column === c));
    }
    loadRows() {
        const filter = toFilter(this.getParameter('filter'));
        filter.species = getSelectedSpecies();
        return getTDPFilteredRows(this.dataSource.db, this.oppositeDataSource.tableName, {}, filter);
    }
    getSelectionColumnLabel(name) {
        return name;
    }
    async getSelectionColumnDesc(_id, name) {
        return Promise.resolve(this.getSelectionColumnLabel(name)).then((nlabel) => this.subTypes.map(({ label, dataSubType, id }) => {
            const clabel = `${nlabel} (${label})`;
            const desc = subTypeDesc(dataSubType, _id, clabel, `col_${id}`);
            desc.selectedSubtype = id;
            return desc;
        }));
    }
    loadSelectionColumnData(name, descs) {
        const filter = toFilter(this.getParameter('filter'));
        const param = {
            name,
            species: getSelectedSpecies()
        };
        const config = descs.map((option) => splitTypes(option.selectedSubtype));
        return config.map(({ dataType, dataSubType }) => {
            return getTDPScore(this.dataSource.db, `${this.oppositeDataSource.base}_${this.dataSource.base}_single_score`, Object.assign({
                table: dataType.tableName,
                attribute: dataSubType.id
            }, param), filter).then(postProcessScore(dataSubType));
        });
    }
}
//# sourceMappingURL=ACombinedDependentTable.js.map