/**
 * Created by sam on 06.03.2017.
 */

import {mutationCat, copyNumberCat, unknownMutationValue, unknownCopyNumberValue, GENE_IDTYPE} from 'targid_common/src/constants';


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
  [key: string]: any;
}

export const cellline:IDataSourceConfig = {
  idType: 'Cellline',
  name: 'Cell Line',
  db: 'bioinfodb',
  schema: 'cellline',
  tableName: 'cellline',
  entityName: 'celllinename',
  base: 'cellline'
};


export const tissue:IDataSourceConfig = {
  idType: 'Tissue',
  name: 'Tissue',
  db: 'bioinfodb',
  schema: 'tissue',
  tableName: 'tissue',
  entityName: 'tissuename',
  base: 'tissue'
};


export const gene:IDataSourceConfig = {
  idType: GENE_IDTYPE,
  name: 'Gene',
  db: 'bioinfodb',
  schema: 'public',
  tableName: 'gene',
  entityName: 'ensg',
  base: 'gene'
};

export const dataSources = [cellline, tissue];

export function chooseDataSource(desc: any): IDataSourceConfig {

  if (typeof(desc) === 'object') {
    return desc.sampleType === 'Tissue' ? tissue : cellline;
  }

  switch (desc) {
    case cellline.name:
      return cellline;
    case tissue.name:
      return tissue;
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
  boxplot :'boxplot'

};

export interface IDataSubtypeConfig {
  id: string;
  name: string;
  type: string;
  useForAggregation: string;

  //type: 'cat';
  categories?: {label: string, name: string, color: string}[];
  missingCategory?: string;

  //type: 'number';
  domain?: number[];
  missingValue?: number;
  constantDomain?: boolean;
}

export const expression:IDataTypeConfig = {
  id: 'expression',
  name: 'Expression',
  tableName: 'expression',
  query: 'expression_score',
  dataSubtypes: [
    { id: 'tpm', name: 'TPM', type: dataSubtypes.number, domain: [-3, 3], missingValue: NaN, constantDomain: true, useForAggregation: 'tpm'},
    { id: 'counts', name: 'Raw Counts', type: dataSubtypes.number, domain: [0, 10000], missingValue: NaN, constantDomain: true, useForAggregation: 'counts'}
  ]
};

export const copyNumber:IDataTypeConfig = {
  id: 'copy_number',
  name: 'Copy Number',
  tableName: 'copynumber',
  query: 'copynumber_score',
  dataSubtypes: [
    { id: 'relativecopynumber', name: 'Relative Copy Number', type: dataSubtypes.number, domain: [0, 15], missingValue: NaN, constantDomain: true, useForAggregation: 'relativecopynumber'},
    { id: 'totalabscopynumber', name: 'Total Absolute Copy Number', type: dataSubtypes.number, domain: [0, 15], missingValue: NaN, constantDomain: true, useForAggregation: 'totalabscopynumber'},
    { id: 'copynumberclass', name: 'Copy Number Class', type: dataSubtypes.cat, categories: toLineUpCategories(copyNumberCat), missingCategory: unknownCopyNumberValue, useForAggregation: 'copynumberclass'}
  ],
};

export const mutation:IDataTypeConfig = {
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
    }
  ]
};

export const dataTypes:IDataTypeConfig[] = [expression, copyNumber, mutation];

function toLineUpCategories(arr: {name: string, value: any, color: string}[]) {
  return arr.map((a) => ({label: a.name, name: String(a.value), color: a.color}));
}

/**
 * splits strings in the form of "DATA_TYPE-DATA_SUBTYPE" and returns the corresponding DATA_TYPE and DATA_SUBTYPE objects
 */
export function splitTypes(toSplit: string): {dataType: IDataTypeConfig, dataSubType: IDataSubtypeConfig} {
  console.assert(toSplit.includes('-'), 'The splitTypes method requires the string to contain a dash ("-")');
  const [type, subtype] = toSplit.split('-');
  let dataType: IDataTypeConfig;

  switch(type) {
    case mutation.id:
      dataType = mutation;
      break;
    case expression.id:
      dataType = expression;
      break;
    case copyNumber.id:
      dataType = copyNumber;
      break;
  }

  const dataSubType = dataType.dataSubtypes.find((element) => element.id === subtype);
  return {
    dataType,
    dataSubType
  };
}
