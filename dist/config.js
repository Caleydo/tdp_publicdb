/**
 * Created by sam on 06.03.2017.
 */
import { __read } from "tslib";
import { mutationCat, copyNumberCat, unknownMutationValue, unknownCopyNumberValue, GENE_IDTYPE } from 'tdp_gene/src/constants';
import { categoricalCol, numberCol, stringCol } from 'tdp_core/src/lineup';
/**
 * maximal number of rows in which just the subset if fetched instead of all
 * @type {number}
 */
export var MAX_FILTER_SCORE_ROWS_BEFORE_ALL = 1000;
export var cellline = {
    idType: 'Cellline',
    name: 'Cell Line',
    db: 'publicdb',
    schema: 'cellline',
    tableName: 'cellline',
    entityName: 'celllinename',
    base: 'cellline',
    columns: function (find) {
        return [
            stringCol('id', { label: 'Name', width: 120 }),
            //categoricalCol('species', desc.columns.species.categories, 'Species', true),
            categoricalCol('tumortype', find('tumortype').categories, { label: 'Tumor Type' }),
            categoricalCol('organ', find('organ').categories, { label: 'Organ' }),
            categoricalCol('gender', find('gender').categories, { label: 'Gender' }),
            categoricalCol('metastatic_site', find('metastatic_site').categories, { label: 'Metastatic Site', visible: false }),
            categoricalCol('histology_type', find('histology_type').categories, { label: 'Histology Type', visible: false }),
            categoricalCol('morphology', find('morphology').categories, { label: 'Morphology', visible: false }),
            categoricalCol('growth_type', find('growth_type').categories, { label: 'Growth Type', visible: false }),
            categoricalCol('age_at_surgery', find('age_at_surgery').categories, { label: 'Age at Surgery', visible: false }),
            categoricalCol('microsatellite_stability_class', find('microsatellite_stability_class').categories, { label: 'Micro Satellite Instability (MSI) Status', visible: false }),
            numberCol('microsatellite_stability_score', 0, find('microsatellite_stability_score').max, { label: 'Micro Satellite Instability (MSI) Score', visible: false }),
            categoricalCol('hla_a_allele1', find('hla_a_allele1').categories, { label: 'Human Leukocyte Antigen (HLA) type allele 1', visible: false }),
            categoricalCol('hla_a_allele2', find('hla_a_allele2').categories, { label: 'Human Leukocyte Antigen (HLA) type allele 2', visible: false }),
            numberCol('mutational_fraction', 0, find('mutational_fraction').max, { label: 'Mutational Burden', visible: false }),
        ];
    },
    columnInfo: {
        string: ['id'],
        number: ['microsatellite_stability_score', 'mutational_fraction'],
        categorical: ['organ', 'gender', 'tumortype', 'metastatic_site', 'histology_type', 'morphology', 'growth_type', 'microsatellite_stability_class', 'hla_a_allele1', 'hla_a_allele2']
    }
};
export var tissue = {
    idType: 'Tissue',
    name: 'Tissue',
    db: 'publicdb',
    schema: 'tissue',
    tableName: 'tissue',
    entityName: 'tissuename',
    base: 'tissue',
    columns: function (find) {
        return [
            stringCol('id', { label: 'Name', width: 120 }),
            //categoricalCol('species', desc.columns.species.categories, 'Species', true),
            categoricalCol('tumortype', find('tumortype').categories, { label: 'Tumor Type' }),
            categoricalCol('organ', find('organ').categories, { label: 'Organ' }),
            categoricalCol('gender', find('gender').categories, { label: 'Gender' }),
            stringCol('tumortype_adjacent', { label: 'Tumor Type adjacent', visible: false }),
            categoricalCol('vendorname', find('vendorname').categories, { label: 'Vendor name', visible: false }),
            categoricalCol('race', find('race').categories, { label: 'Race', visible: false }),
            categoricalCol('ethnicity', find('ethnicity').categories, { label: 'Ethnicity', visible: false }),
            numberCol('age', find('age').min, find('age').max, { label: 'Age', visible: false }),
            numberCol('days_to_death', 0, find('days_to_death').max, { label: 'Days to death', visible: false }),
            numberCol('days_to_last_followup', 0, find('days_to_last_followup').max, { label: 'Days to last follow up', visible: false }),
            categoricalCol('vital_status', find('vital_status').categories, { label: 'Vital status', visible: false }),
            numberCol('height', 0, find('height').max, { label: 'Height', visible: false }),
            numberCol('weight', 0, find('weight').max, { label: 'Weight', visible: false }),
            numberCol('bmi', 0, find('bmi').max, { label: 'Body Mass Index (BMI)', visible: false }),
            categoricalCol('microsatellite_stability_class', find('microsatellite_stability_class').categories, { label: 'Micro Satellite Instability (MSI) Status', visible: false }),
            numberCol('microsatellite_stability_score', 0, find('microsatellite_stability_score').max, { label: 'Micro Satellite Instability (MSI) Score', visible: false }),
            categoricalCol('hla_a_allele1', find('hla_a_allele1').categories, { label: 'Human Leukocyte Antigen (HLA) type allele 1', visible: false }),
            categoricalCol('hla_a_allele2', find('hla_a_allele2').categories, { label: 'Human Leukocyte Antigen (HLA) type allele 2', visible: false }),
            numberCol('mutational_fraction', 0, find('mutational_fraction').max, { label: 'Mutational Burden', visible: false }),
        ];
    },
    columnInfo: {
        string: ['id', 'tumortype_adjacent'],
        number: ['age', 'days_to_death', 'days_to_last_followup', 'height', 'weight', 'bmi', 'microsatellite_stability_score', 'mutational_fraction'],
        categorical: ['organ', 'gender', 'tumortype', 'vendorname', 'race', 'ethnicity', 'vital_status', 'microsatellite_stability_class', 'hla_a_allele1', 'hla_a_allele2']
    }
};
function toChromosomes(categories) {
    var order = new Map();
    for (var i = 1; i <= 22; ++i) {
        order.set(String(i), i);
    }
    order.set('x', 23);
    order.set('y', 24);
    order.set('mt', 25);
    categories.sort(function (a, b) {
        var an = a.toLowerCase();
        var bn = b.toLowerCase();
        var ai = order.get(an);
        var bi = order.get(bn);
        if (ai === bi) {
            return an.localeCompare(bn);
        }
        if (ai == null) {
            return 1;
        }
        if (bi == null) {
            return -1;
        }
        return ai - bi;
    });
    return categories.map(function (d, i) { return ({ name: d, label: d, value: i }); });
}
export var gene = {
    idType: GENE_IDTYPE,
    name: 'Gene',
    db: 'publicdb',
    schema: 'public',
    tableName: 'gene',
    entityName: 'ensg',
    base: 'gene',
    columns: function (find) {
        var maxRegion = Math.max(find('seqregionstart').max, find('seqregionend').max);
        return [
            stringCol('symbol', { label: 'Symbol', width: 100 }),
            stringCol('id', { label: 'Ensembl', width: 120 }),
            stringCol('name', { label: 'Name' }),
            categoricalCol('chromosome', toChromosomes(find('chromosome').categories), { label: 'Chromosome' }),
            categoricalCol('biotype', find('biotype').categories, { label: 'Biotype' }),
            categoricalCol('strand', [{ label: 'reverse strand', name: String(-1) }, { label: 'forward strand', name: String(1) }], { label: 'Strand', visible: false }),
            numberCol('seqregionstart', 0, maxRegion, { label: 'Seq Region Start', visible: false, extras: { renderer: 'default' } }),
            numberCol('seqregionend', 0, maxRegion, { label: 'Seq Region End', visible: false, extras: { renderer: 'default' } }),
        ];
    },
    columnInfo: {
        string: ['id', 'symbol', 'name', 'chromosome', 'seqregionstart', 'seqregionend'],
        number: [],
        categorical: ['biotype', 'strand']
    }
};
export var dataSources = [cellline, tissue];
export function chooseDataSource(desc) {
    if (typeof (desc) === 'object') {
        if (desc.sampleType === 'Tissue' || desc.idtype === 'Tissue' || desc.idType === 'Tissue') {
            return tissue;
        }
        else if (desc.sampleType === 'Cellline' || desc.idtype === 'Cellline' || desc.idType === 'Cellline') {
            return cellline;
        }
        else {
            return gene;
        }
    }
    switch (desc) {
        case cellline.name:
            return cellline;
        case tissue.name:
            return tissue;
        case gene.name:
            return gene;
    }
}
/**
 * list of possible types
 */
export var dataSubtypes = {
    number: 'number',
    string: 'string',
    cat: 'cat',
    boxplot: 'boxplot'
};
export var expression = {
    id: 'expression',
    name: 'Expression',
    tableName: 'expression',
    query: 'expression_score',
    dataSubtypes: [
        {
            id: 'tpm',
            name: 'Normalized Gene Expression (TPM Values)',
            type: dataSubtypes.number,
            domain: [-3, 3],
            missingValue: NaN,
            constantDomain: true,
            useForAggregation: 'tpm'
        },
        {
            id: 'counts',
            name: 'Raw Counts',
            type: dataSubtypes.number,
            domain: [0, 10000],
            missingValue: NaN,
            constantDomain: true,
            useForAggregation: 'counts'
        }
    ]
};
export var copyNumber = {
    id: 'copy_number',
    name: 'Copy Number',
    tableName: 'copynumber',
    query: 'copynumber_score',
    dataSubtypes: [
        {
            id: 'relativecopynumber',
            name: 'Relative Copy Number',
            type: dataSubtypes.number,
            domain: [0, 15],
            missingValue: NaN,
            constantDomain: true,
            useForAggregation: 'relativecopynumber'
        },
        {
            id: 'totalabscopynumber',
            name: 'Total Absolute Copy Number',
            type: dataSubtypes.number,
            domain: [0, 15],
            missingValue: NaN,
            constantDomain: true,
            useForAggregation: 'totalabscopynumber'
        },
        {
            id: 'copynumberclass',
            name: 'Copy Number Class',
            type: dataSubtypes.cat,
            categories: toLineUpCategories(copyNumberCat),
            domain: [0, 100],
            missingValue: NaN,
            missingCategory: unknownCopyNumberValue,
            useForAggregation: 'copynumberclass'
        }
    ],
};
export var mutation = {
    id: 'mutation',
    name: 'Mutation',
    tableName: 'mutation',
    query: 'alteration_mutation_frequency',
    dataSubtypes: [
        //it is a cat by default but in the frequency case also a number?
        {
            id: 'aa_mutated',
            name: 'AA Mutated',
            type: dataSubtypes.cat,
            categories: toLineUpCategories(mutationCat),
            missingCategory: unknownMutationValue,
            useForAggregation: 'aa_mutated',
            domain: [0, 100],
            missingValue: NaN
        },
        //just for single score:
        {
            id: 'aamutation', name: 'AA Mutation', type: dataSubtypes.string, useForAggregation: '',
            domain: [0, 100],
            missingValue: NaN
        },
        {
            id: 'dna_mutated',
            name: 'DNA Mutated',
            type: dataSubtypes.cat,
            categories: toLineUpCategories(mutationCat),
            missingCategory: unknownMutationValue,
            useForAggregation: 'dna_mutated',
            domain: [0, 100],
            missingValue: NaN
        },
        //just for single score:
        {
            id: 'dnamutation', name: 'DNA Mutation', type: dataSubtypes.string, useForAggregation: '',
            domain: [0, 100],
            missingValue: NaN
        },
        {
            id: 'zygosity',
            name: 'Zygosity',
            type: dataSubtypes.number,
            domain: [0, 15],
            missingValue: NaN,
            useForAggregation: 'zygosity'
        }
    ]
};
export var depletion = {
    id: 'depletion',
    name: 'Depletion Screen ',
    tableName: 'depletionscore',
    query: 'depletion_score',
    dataSubtypes: [
        {
            id: 'rsa',
            name: 'DRIVE RSA (ER McDonald III et al., Cell, 2017)',
            type: dataSubtypes.number,
            domain: [-3, 3],
            missingValue: NaN,
            constantDomain: false,
            useForAggregation: 'rsa'
        },
        {
            id: 'ataris',
            name: 'DRIVE ATARiS (ER McDonald III et al., Cell, 2017)',
            type: dataSubtypes.number,
            domain: [0, 10000],
            missingValue: NaN,
            constantDomain: false,
            useForAggregation: 'ataris'
        },
        {
            id: 'ceres',
            name: 'Avana CERES (Robin M. Meyers et al., Nature Genetics, 2017)',
            type: dataSubtypes.number,
            domain: [0, 10000],
            missingValue: NaN,
            constantDomain: false,
            useForAggregation: 'ceres'
        }
    ]
};
export var dataTypes = [expression, copyNumber, mutation];
function toLineUpCategories(arr) {
    return arr.map(function (a) { return ({ label: a.name, name: String(a.value), color: a.color }); });
}
/**
 * splits strings in the form of "DATA_TYPE-DATA_SUBTYPE" and returns the corresponding DATA_TYPE and DATA_SUBTYPE objects
 */
export function splitTypes(toSplit) {
    console.assert(toSplit.includes('-'), 'The splitTypes method requires the string to contain a dash ("-")');
    var _a = __read(toSplit.split('-'), 2), type = _a[0], subtype = _a[1];
    return resolveDataTypes(type, subtype);
}
export function resolveDataTypes(dataTypeId, dataSubTypeId) {
    var dataType;
    switch (dataTypeId) {
        case mutation.id:
            dataType = mutation;
            break;
        case expression.id:
            dataType = expression;
            break;
        case copyNumber.id:
            dataType = copyNumber;
            break;
        case depletion.id:
            dataType = depletion;
            break;
    }
    var dataSubType = dataType.dataSubtypes.find(function (element) { return element.id === dataSubTypeId; });
    return {
        dataType: dataType,
        dataSubType: dataSubType
    };
}
//# sourceMappingURL=config.js.map
//# sourceMappingURL=config.js.map