/**
 * Created by Samuel Gratzl on 27.04.2016.
 */
import { ResolveUtils } from 'tdp_core';
import { AD3View } from 'tdp_core';
import { SpeciesUtils } from 'tdp_gene';
import { cellline, tissue, gene } from '../common/config';
import { transpose as d3Transpose } from 'd3';
import { RestBaseUtils } from 'tdp_core';
export class AInfoTable extends AD3View {
    constructor(context, selection, parent, dataSource) {
        super(context, selection, parent);
        this.dataSource = dataSource;
        this.fields = this.getFields();
        this.$table = this.$node
            .append('table')
            .classed('table table-striped table-hover table-bordered table-condensed', true);
        this.$thead = this.$table.append('thead').append('tr');
        this.$tbody = this.$table.append('tbody');
    }
    initImpl() {
        super.initImpl();
        this.$node.classed('infoTable', true);
        return this.update();
    }
    selectionChanged() {
        super.selectionChanged();
        this.update();
    }
    async fetchInformation() {
        const ids = await ResolveUtils.resolveIds(this.selection.idtype, this.selection.range, this.dataSource.idType);
        const results = await RestBaseUtils.getTDPFilteredRows(this.dataSource.db, `${this.dataSource.base}_all_columns`, {
            species: SpeciesUtils.getSelectedSpecies()
        }, { [this.dataSource.entityName]: ids });
        this.data = this.transformData(results);
    }
    async update() {
        this.setBusy(true);
        try {
            await this.fetchInformation();
            this.setBusy(false);
            this.updateInfoTable(this.data);
        }
        catch (error) {
            console.error(error);
            this.setBusy(false);
        }
    }
    /**
     * creates a 2D Array with the Gene symbols or Cell Line name as headers and the dbResults' properties as first column
     * @param dbResults Array of Objects
     * @param transposeTable
     * @returns string[][]
     */
    transformData(dbResults, transposeTable = false) {
        const header = ['Field Name'];
        const dataMap = new Map();
        dbResults.forEach((datum) => {
            header.push(datum.id || 'Values');
            Object.keys(datum).forEach((key) => {
                if (key === 'id' || key === 'tdpid') {
                    return;
                }
                if (!dataMap.has(key)) {
                    dataMap.set(key, [datum[key]]);
                }
                else {
                    dataMap.get(key).push(datum[key]);
                }
            });
        });
        // convert Map to Array and concatenate the first elements (keys) with their values to get a full row
        // and sort the rows according to the defined weights
        const body = Array
            .from(dataMap)
            .map((d) => [d[0], ...d[1]])
            .sort((a, b) => {
            const first = this.fields.find((f) => f.key === a[0]);
            const second = this.fields.find((f) => f.key === b[0]);
            // show elements that have no defined order at the bottom by default
            if (!first && !second) {
                return 0; // both not found --> assume they are equal
            }
            else if (!first) {
                return 1; // order for a not defined --> sort b to lower index
            }
            else if (!second) {
                return -1; // order for b not defined --> sort a to lower index
            }
            return first.order - second.order;
        });
        if (transposeTable) {
            return d3Transpose([header, ...body]);
        }
        return [header, ...body];
    }
    updateInfoTable(data) {
        const $th = this.$thead.selectAll('th').data(data[0]);
        $th.enter().append('th');
        $th.text((d) => d);
        const $tr = this.$tbody.selectAll('tr').data(data.slice(1));
        //
        // // ENTER selection for table rows
        $tr.enter().append('tr');
        //
        // append td elements for each tr using a nested D3 selection
        // UPDATE selection for table rows
        const $td = $tr.selectAll('td').data((d) => d);
        // ENTER selection for table data
        $td.enter().append('td');
        // UPDATE selection for table data
        $td.text((d) => d);
        $td.exit().remove();
        $tr.exit().remove();
        $th.exit().remove();
    }
}
export class CelllineInfoTable extends AInfoTable {
    constructor(context, selection, parent) {
        super(context, selection, parent, cellline);
    }
    getFields() {
        return [
            {
                key: 'celllinename',
                order: 10
            },
            {
                key: 'species',
                order: 20
            },
            {
                key: 'organ',
                order: 30
            },
            {
                key: 'tissue_subtype',
                order: 40
            },
            {
                key: 'metastatic_site',
                order: 50
            },
            {
                key: 'histology_type',
                order: 60
            },
            {
                key: 'morphology',
                order: 70
            },
            {
                key: 'tumortype',
                order: 80
            },
            {
                key: 'growth_type',
                order: 90
            },
            {
                key: 'gender',
                order: 100
            },
            {
                key: 'ploidy',
                order: 110
            },
            {
                key: 'age_at_surgery',
                order: 120
            },
            {
                key: 'stage',
                order: 130
            },
            {
                key: 'grade',
                order: 140
            },
            {
                key: 'atcc_no',
                order: 150
            },
            {
                key: 'dsmz_no',
                order: 160
            },
            {
                key: 'ecacc_no',
                order: 170
            },
            {
                key: 'jcrb_no',
                order: 180
            },
            {
                key: 'iclc_no',
                order: 190
            },
            {
                key: 'riken_no',
                order: 200
            },
            {
                key: 'kclb_no',
                order: 210
            },
            {
                key: 'cosmicid',
                order: 220
            },
            {
                key: 'pubmed',
                order: 230
            },
            {
                key: 'comment',
                order: 240
            }
        ];
    }
}
export class GeneInfoTable extends AInfoTable {
    constructor(context, selection, parent) {
        super(context, selection, parent, gene);
    }
    getFields() {
        return [
            {
                key: 'ensg',
                order: 10
            },
            {
                key: 'symbol',
                order: 20
            },
            {
                key: 'name',
                order: 30
            },
            {
                key: 'biotype',
                order: 40
            },
            {
                key: 'species',
                order: 50
            },
            {
                key: 'chromosome',
                order: 60
            },
            {
                key: 'seqregionstart',
                order: 70
            },
            {
                key: 'seqregionend',
                order: 80
            },
            {
                key: 'strand',
                order: 90
            },
            {
                key: 'cosmic_id_gene',
                order: 100
            },
            {
                key: 'gc_content',
                order: 110
            }
        ];
    }
}
export class TissueInfoTable extends AInfoTable {
    constructor(context, selection, parent) {
        super(context, selection, parent, tissue);
    }
    getFields() {
        return [
            {
                key: 'tissuename',
                order: 10
            },
            {
                key: 'vendorname',
                order: 20
            },
            {
                key: 'species',
                order: 30
            },
            {
                key: 'organ',
                order: 40
            },
            {
                key: 'tumortype',
                order: 50
            },
            {
                key: 'patientname',
                order: 60
            },
            {
                key: 'tumortype_adjacent',
                order: 70
            },
            {
                key: 'tissue_subtype',
                order: 80
            },
            {
                key: 'metastatic_site',
                order: 90
            },
            {
                key: 'histology_type',
                order: 100
            },
            {
                key: 'histology_subtype',
                order: 110
            },
            {
                key: 'gender',
                order: 120
            },
            {
                key: 'age_at_surgery',
                order: 120
            },
            {
                key: 'stage',
                order: 130
            },
            {
                key: 'grade',
                order: 140
            },
            {
                key: 'sample_description',
                order: 150
            },
            {
                key: 'comment',
                order: 160
            }
        ];
    }
}
//# sourceMappingURL=InfoTable.js.map