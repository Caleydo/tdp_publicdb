/**
 * Created by sam on 06.03.2017.
 */

import {mutationCat, copyNumberCat, unknownMutationValue, unknownCopyNumberValue, GENE_IDTYPE} from 'targid_common/src/constants';

export const allTypes = 'All Tumor Types';
export const allBioTypes = 'All Bio Types';
//select distinct tumortype from cellline where tumortype is not null


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

export interface ITumorTypeDataSourceConfig extends IDataSourceConfig {
  tumorTypes: string[];
  tumorTypesWithAll: string[];
}

export interface IBioTypeDataSourceConfig extends IDataSourceConfig {
  bioTypes: string[];
  bioTypesWithAll: string[];
}

const celllinesTumorTypes = ['adrenal gland carcinoma', 'astrocytoma/glioblastoma', 'bladder carcinoma', 'bone sarcoma',
  'breast carcinoma', 'cervix carcinoma', 'colon carcinoma', 'esophagus carcinoma', 'gallbladder carcinoma',
  'gastric carcinoma', 'hematopoietic/leukemia', 'hematopoietic/lymphoma', 'hematopoietic/myeloma', 'HNSCC', 'liver carcinoma',
  'medulloblastoma', 'melanoma ', 'melanoma', 'mesothelioma', 'neuroblastoma', 'normal', 'NSCLC', 'ovarian carcinoma', 'pancreas carcinoma',
  'pancreatic insulinoma', 'placenta carcinoma', 'prostate benign hyperplasia', 'prostate carcinoma', 'renal cancer other', 'renal carcinoma',
  'retinoblastoma', 'rhabdomyosarcoma', 'sarcoma/soft tissue', 'SCLC', 'SCLC/neuroendocrine', 'skin/SCC', 'thyroid carcinoma', 'uterus carcinoma', 'vulva carcinoma'];

export const cellline:ITumorTypeDataSourceConfig = {
  idType: 'Cellline',
  name: 'Cell Line',
  db: 'bioinfodb',
  schema: 'cellline',
  tableName: 'cellline',
  entityName: 'celllinename',
  base: 'cellline',
  tumorTypes: celllinesTumorTypes,
  tumorTypesWithAll : [allTypes].concat(celllinesTumorTypes)
};

const tissueTumorTypes = [
  'Acute Myeloid Leukemia',
  'Adrenal Gland',
  'Adrenocortical carcinoma',
  'Artery - Aorta',
  'Bladder',
  'Bladder Urothelial Carcinoma',
  'Brain - Cerebellum',
  'Brain - Cortex',
  'Brain Lower Grade Glioma',
  'Brain - Spinal cord (cervical c-1)',
  'breast carcinoma',
  'Breast invasive carcinoma',
  'Cervical squamous cell carcinoma and endocervical adenocarcinoma',
  'Cervix - Ectocervix',
  'Cervix - Endocervix',
  'Cholangiocarcinoma',
  'Colon adenocarcinoma',
  'colon carcinoma',
  'Colon - Sigmoid',
  'Colon - Transverse',
  'Esophageal carcinoma',
  'Esophagus - Gastroesophageal Junction',
  'Esophagus - Mucosa',
  'Esophagus - Muscularis',
  'Fallopian Tube',
  'Glioblastoma multiforme',
  'Head and Neck squamous cell carcinoma',
  'Heart - Atrial Appendage',
  'Heart - Left Ventricle',
  'Kidney Chromophobe',
  'Kidney renal clear cell carcinoma',
  'Kidney renal papillary cell carcinoma',
  'large cell lung carcinoma',
  'Liver',
  'Liver hepatocellular carcinoma',
  'lung adenocarcinoma',
  'Lung adenocarcinoma',
  'lung adenosquamous carcinoma',
  'lung clear cell carcinoma, sarcomatoid carcinoma',
  'lung large cell neuroendocrine carcinoma',
  'lung squamous cell carcinoma',
  'Lung squamous cell carcinoma',
  'Lymphoid Neoplasm Diffuse Large B-cell Lymphoma',
  'Mesothelioma',
  'Minor Salivary Gland',
  'Muscle - Skeletal',
  'NEC',
  'Nerve - Tibial',
  'non small cell lung cancer',
  'normal',
  'Ovarian',
  'Ovarian serous cystadenocarcinoma',
  'Ovary',
  'Pancreas',
  'Pancreatic adenocarcinoma',
  'Pheochromocytoma and Paraganglioma',
  'Pituitary',
  'PNET',
  'Prostate adenocarcinoma',
  'Rectum adenocarcinoma',
  'Sarcoma',
  'SCLC',
  'SCLC, NEC',
  'Skin Cutaneous Melanoma',
  'Skin - Sun Exposed (Lower leg)',
  'small cell lung cancer',
  'Spleen',
  'Stomach',
  'Stomach adenocarcinoma',
  'Testicular Germ Cell Tumors',
  'Testis',
  'Thymoma',
  'Thyroid carcinoma',
  'unclear',
  'Uterine Carcinosarcoma',
  'Uterine Corpus Endometrial Carcinoma',
  'Uveal Melanoma'];


export const tissue:ITumorTypeDataSourceConfig = {
  idType: 'Tissue',
  name: 'Tissue',
  db: 'bioinfodb',
  schema: 'tissue',
  tableName: 'tissue',
  entityName: 'tissuename',
  base: 'tissue',
  tumorTypes: tissueTumorTypes,
  tumorTypesWithAll : [allTypes].concat(tissueTumorTypes)
};

const geneBioTypes = [
  '3prime_overlapping_ncrna',
  'antisense',
  'IG_C_gene',
  'IG_C_pseudogene',
  'IG_D_gene',
  'IG_J_gene',
  'IG_J_pseudogene',
  'IG_LV_gene',
  'IG_V_gene',
  'IG_V_pseudogene',
  'lincRNA',
  'LRG_gene',
  'miRNA',
  'misc_RNA',
  'Mt_rRNA',
  'Mt_tRNA',
  'non_coding',
  'polymorphic_pseudogene',
  'processed_pseudogene',
  'processed_transcript',
  'protein_coding',
  'pseudogene',
  'rRNA',
  'sense_intronic',
  'sense_overlapping',
  'snoRNA',
  'snRNA',
  'TR_C_gene',
  'TR_D_gene',
  'TR_J_gene',
  'TR_J_pseudogene',
  'TR_V_gene',
  'TR_V_pseudogene'
];

export const gene:IBioTypeDataSourceConfig = {
  idType: GENE_IDTYPE,
  name: 'Gene',
  db: 'bioinfodb',
  schema: 'public',
  tableName: 'gene',
  entityName: 'ensg',
  base: 'gene',
  bioTypes: geneBioTypes,
  bioTypesWithAll : [allBioTypes].concat(geneBioTypes)
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
