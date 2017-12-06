/**
 * Created by sam on 06.03.2017.
 */

import {
  mutationCat,
  copyNumberCat,
  unknownMutationValue,
  unknownCopyNumberValue,
  GENE_IDTYPE
} from 'tdp_gene/src/constants';
import {IServerColumn} from 'tdp_core/src/rest';
import {categoricalCol, numberCol, stringCol} from 'tdp_core/src/lineup';
import {IAdditionalColumnDesc} from 'tdp_core/src/lineup/desc';


/**
 * maximal number of rows in which just the subset if fetched instead of all
 * @type {number}
 */
export const MAX_FILTER_SCORE_ROWS_BEFORE_ALL = 1000;


export interface IDataSourceConfig {
  idType: string;
  name: string;
  db: string;
  schema: string;
  tableName: string;
  entityName: string;
  base: string;

  columns(find: (column: string)=>IServerColumn): IAdditionalColumnDesc[];

  [key: string]: any;
}

export const cellline: IDataSourceConfig = {
  idType: 'Cellline',
  name: 'Cell Line',
  db: 'publicdb',
  schema: 'cellline',
  tableName: 'cellline',
  entityName: 'celllinename',
  base: 'cellline',
  columns: (find: (column: string)=>IServerColumn) => {
    return [
      stringCol('id', {label: 'Name', width: 120}),
      //categoricalCol('species', desc.columns.species.categories, 'Species', true),
      categoricalCol('tumortype', find('tumortype').categories, {label: 'Tumor Type'}),
      categoricalCol('organ', find('organ').categories, {label: 'Organ'}),
      categoricalCol('gender', find('gender').categories, {label: 'Gender'}),
      categoricalCol('metastatic_site', find('metastatic_site').categories, {label: 'Metastatic Site', visible: false}),
      categoricalCol('histology_type', find('histology_type').categories, {label: 'Histology Type', visible: false}),
      categoricalCol('morphology', find('morphology').categories, {label: 'Morphology', visible: false}),
      categoricalCol('growth_type', find('growth_type').categories, {label: 'Growth Type', visible: false}),
      categoricalCol('age_at_surgery', find('age_at_surgery').categories, {label: 'Age at Surgery', visible: false}),
    ];
  },
  columnInfo: {
    string: ['id'],
    number: [],
    categorical: ['organ', 'gender', 'tumortype', 'metastatic_site', 'histology_type', 'morphology', 'growth_type']
  }
};


export const tissue: IDataSourceConfig = {
  idType: 'Tissue',
  name: 'Tissue',
  db: 'publicdb',
  schema: 'tissue',
  tableName: 'tissue',
  entityName: 'tissuename',
  base: 'tissue',
  columns: (find: (column: string)=>IServerColumn) => {
    return [
      stringCol('id', {label: 'Name', width: 120}),
      //categoricalCol('species', desc.columns.species.categories, 'Species', true),
      categoricalCol('tumortype', find('tumortype').categories, {label: 'Tumor Type'}),
      categoricalCol('organ',find('organ').categories, {label: 'Organ'}),
      categoricalCol('gender', find('gender').categories, {label: 'Gender'}),
      stringCol('tumortype_adjacent', {label: 'Tumor Type adjacent', visible: false}),
      categoricalCol('vendorname', find('vendorname').categories, {label: 'Vendor name', visible: false}),
      categoricalCol('race',find('race').categories, {label: 'Race', visible: false}),
      categoricalCol('ethnicity', find('ethnicity').categories, {label: 'Ethnicity',  visible: false}),
      numberCol('age', find('age').min, find('age').max, {label: 'Age',  visible: false}),
      numberCol('days_to_death', 0, find('days_to_death').max, {label: 'Days to death',  visible: false}),
      numberCol('days_to_last_followup', 0, find('days_to_last_followup').max, {label: 'Days to last follow up',  visible: false}),
      categoricalCol('vital_status', find('vital_status').categories, {label: 'Vital status',  visible: false}),
      numberCol('height', 0, find('height').max, {label: 'Height',  visible: false}),
      numberCol('weight', 0, find('weight').max, {label: 'Weight',  visible: false}),
      numberCol('bmi', 0, find('bmi').max, {label: 'Body Mass Index (BMI)',  visible: false})
    ];
  }
};


const factor = 0.03;
const chromosome = Object.assign(categoricalCol('chromosome', [], {label: 'Chromosome'}), {
  type: 'ordinal',
  categories: [
    {name: '1', color: '#99671f', value: 1 * factor},
    {name: '2', color: '#63641b', value: 2 * factor},
    {name: '3', color: '#929539', value: 3 * factor},
    {name: '4', color: '#d1011c', value: 4 * factor},
    {name: '5', color: '#fe0125', value: 5 * factor},
    {name: '6', color: '#ff00ca', value: 6 * factor},
    {name: '7', color: '#ffcbcc', value: 7 * factor},
    {name: '8', color: '#ff9a32', value: 8 * factor},
    {name: '9', color: '#ffcc39', value: 9 * factor},
    {name: '10', color: '#feff43', value: 10 * factor},
    {name: '11', color: '#c5ff40', value: 11 * factor},
    {name: '12', color: '#00ff3b', value: 12 * factor},
    {name: '13', color: '#26871f', value: 13 * factor},
    {name: '14', color: '#1b00c9', value: 14 * factor},
    {name: '15', color: '#6694fa', value: 15 * factor},
    {name: '16', color: '#95cafc', value: 16 * factor},
    {name: '17', color: '#00fffe', value: 17 * factor},
    {name: '18', color: '#c7fffe', value: 18 * factor},
    {name: '19', color: '#9b00c8', value: 19 * factor},
    {name: '20', color: '#d129f7', value: 20 * factor},
    {name: '21', color: '#d390fa', value: 21 * factor},
    {name: '22', color: '#666666', value: 22 * factor},
    {name: 'x', color: '#989898', value: 23 * factor},
    {name: 'y', color: '#cbcbcb', value: 24 * factor},
    {name: 'm', color: '#cdcf97', value: 25 * factor},
    {name: 'na', color: '#dedede', value: 26 * factor},
    {name: 'un', color: '#62ce54', value: 27 * factor}
  ],
  rendererType: 'categorical',
  groupRenderer: 'categorical'
});


export const gene: IDataSourceConfig = {
  idType: GENE_IDTYPE,
  name: 'Gene',
  db: 'publicdb',
  schema: 'public',
  tableName: 'gene',
  entityName: 'ensg',
  base: 'gene',
  columns: (find: (column: string)=>IServerColumn) => {
    return [
      stringCol('symbol', {label: 'Symbol', width: 100}),
      stringCol('id', {label: 'Ensembl', width: 120}),
      stringCol('name', {label: 'Name'}),
      chromosome,
      categoricalCol('biotype', find('biotype').categories, {label: 'Biotype'}),
      categoricalCol('strand', [{ label: 'reverse strand', name:String(-1)}, { label: 'forward strand', name:String(1)}], {label: 'Strand', visible: false}),
      stringCol('seqregionstart', {label: 'Seq Region Start', visible: false}),
      stringCol('seqregionend', {label: 'Seq Region End', visible: false})
    ];
  },
  columnInfo: {
    string: ['id', 'symbol', 'name', 'chromosome', 'seqregionstart', 'seqregionend'],
    number: [],
    categorical: ['biotype', 'strand']
  }
};

export const dataSources = [cellline, tissue];

export function chooseDataSource(desc: any): IDataSourceConfig {
  if (typeof(desc) === 'object') {
    if(desc.sampleType === 'Tissue' || desc.idtype === 'Tissue' || desc.idType === 'Tissue') {
      return tissue;
    } else if(desc.sampleType === 'Cellline' || desc.idtype === 'Cellline' || desc.idType === 'Cellline') {
      return cellline;
    } else {
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

export interface IDataTypeConfig {
  id: string;
  name: string;
  tableName: string;
  query: string;
  dataSubtypes: IDataSubtypeConfig[];
}

/**
 * list of possible types
 */
export const dataSubtypes = {
  number: 'number',
  string: 'string',
  cat: 'cat',
  boxplot: 'boxplot'

};

export interface IDataSubtypeConfig {
  id: string;
  name: string;
  type: string;
  useForAggregation: string;

  //type: 'cat';
  categories?: { label: string, name: string, color: string }[];
  missingCategory?: string;

  //type: 'number';
  domain?: number[];
  missingValue?: number;
  constantDomain?: boolean;
}

export const expression: IDataTypeConfig = {
  id: 'expression',
  name: 'Expression',
  tableName: 'expression',
  query: 'expression_score',
  dataSubtypes: [
    {
      id: 'tpm',
      name: 'TPM',
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

export const copyNumber: IDataTypeConfig = {
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

export const mutation: IDataTypeConfig = {
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

export const depletion: IDataTypeConfig = {
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


export const dataTypes: IDataTypeConfig[] = [expression, copyNumber, mutation];

function toLineUpCategories(arr: { name: string, value: any, color: string }[]) {
  return arr.map((a) => ({label: a.name, name: String(a.value), color: a.color}));
}

/**
 * splits strings in the form of "DATA_TYPE-DATA_SUBTYPE" and returns the corresponding DATA_TYPE and DATA_SUBTYPE objects
 */
export function splitTypes(toSplit: string): { dataType: IDataTypeConfig, dataSubType: IDataSubtypeConfig } {
  console.assert(toSplit.includes('-'), 'The splitTypes method requires the string to contain a dash ("-")');
  const [type, subtype] = toSplit.split('-');
  return resolveDataTypes(type, subtype);
}

export function resolveDataTypes(dataTypeId: string, dataSubTypeId: string) {
  let dataType: IDataTypeConfig;

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

  const dataSubType = dataType.dataSubtypes.find((element) => element.id === dataSubTypeId);
  return {
    dataType,
    dataSubType
  };
}
