/**
 * Created by sam on 06.03.2017.
 */

import {SPECIES_SESSION_KEY, getSelectedSpecies} from 'targid_common/src/Common';
import {FORM_EXPRESSION_SUBTYPE_ID, FORM_COPYNUMBER_SUBTYPE_ID} from 'targid_common/src/forms';
import {FormElementType, IFormElement} from 'ordino/src/form';
import {cachedLazy} from 'ordino/src/cached';
import {getAPIJSON, api2absURL} from 'phovea_core/src/ajax';
import {gene, IDataSourceConfig, tissue, cellline, dataSources} from './config';
import {listNamedSetsAsOptions} from 'ordino/src/storage';

/**
 * List of ids for parameter form elements
 * Reuse this ids and activate the `useSession` option for form elements to have the same selectedIndex between different views
 */
export class ParameterFormIds {
  static SPECIES = SPECIES_SESSION_KEY; // used as db field! be careful when renaming
  static DATA_SOURCE = 'data_source';
  static FILTER_BY = 'filter_by';
  static GENE_SYMBOL = 'gene_symbol';
  static CELLLINE_NAME = 'cellline_name';
  static TISSUE_NAME = 'tissue_name';
  static TUMOR_TYPE = 'tumor_type';
  static TISSUE_PANEL_NAME = 'tissue_panel_name';
  static ALTERATION_TYPE = 'alteration_type';
  static DATA_TYPE = 'data_type';
  static DATA_SUBTYPE = 'data_subtype';
  static COPYNUMBER_SUBTYPE = FORM_COPYNUMBER_SUBTYPE_ID;
  static EXPRESSION_SUBTYPE = FORM_EXPRESSION_SUBTYPE_ID;
  static BIO_TYPE = 'bio_type';
  static AGGREGATION = 'aggregation';
  static COMPARISON_OPERATOR = 'comparison_operator';
  static COMPARISON_VALUE = 'comparison_value';
}

export const COMPARISON_OPERATORS = [
  {name: '&lt; less than', value: '<', data: '<'},
  {name: '&lt;= less equal', value: '<=', data: '<='},
  {name: 'not equal to', value: '<>', data: '<>'},
  {name: '&gt;= greater equal', value: '>=', data: '>='},
  {name: '&gt; greater than', value: '>', data: '>'}
];

export const MUTATION_AGGREGATION = [
  {name: 'Frequency', value: 'frequency', data: 'frequency'},
  {name: 'Count', value: 'count', data: 'count'}
];

export const NUMERIC_AGGREGATION = [
  {name: 'Average', value: 'avg', data: 'avg'},
  {name: 'Median', value: 'median', data: 'median'},
  {name: 'Min', value: 'min', data: 'min'},
  {name: 'Max', value: 'max', data: 'max'},
  {name: 'Frequency', value: 'frequency', data: 'frequency'},
  {name: 'Count', value: 'count', data: 'count'},
  {name: 'Boxplot', value: 'boxplot', data: 'boxplot'}
];


function buildPredefinedNamedSets(ds: IDataSourceConfig) {
  return getAPIJSON(`/targid/db/${ds.db}/${ds.base}_panel`).then((panels: {id: string}[]) => panels.map((p) => p.id));
}

export const FORM_GENE_NAME = {
  type: FormElementType.SELECT2,
  label: 'Gene Symbol',
  id: ParameterFormIds.GENE_SYMBOL,
  attributes: {
    style: 'width:100%'
  },
  options: {
    optionsData: [],
    ajax: {
      url: api2absURL(`/targid/db/${gene.db}/${gene.base}_items/lookup`),
      data: (params: any) => {
        return {
          column: 'symbol',
          species: getSelectedSpecies(),
          query: params.term,
          page: params.page
        };
      }
    },
    templateResult: (item: any) => (item.id) ? `${item.text} <span class="ensg">${item.id}</span>` : item.text,
    templateSelection: (item: any) => (item.id) ? `${item.text} <span class="ensg">${item.id}</span>` : item.text
  },
  useSession: true
};

function generateNameLookup(d: IDataSourceConfig, field: string) {
  return {
    type: FormElementType.SELECT2,
    label: d.name,
    id: field,
    attributes: {
      style: 'width:100%'
    },
    options: {
      optionsData: [],
      ajax: {
        url: api2absURL(`/targid/db/${d.db}/${d.base}_items/lookup`),
        data: (params: any) => {
          return {
            column: d.entityName,
            species: getSelectedSpecies(),
            query: params.term,
            page: params.page
          };
        }
      }
    },
    useSession: true
  };
}

export const FORM_TISSUE_NAME = generateNameLookup(tissue, ParameterFormIds.TISSUE_NAME);
export const FORM_CELLLINE_NAME = generateNameLookup(cellline, ParameterFormIds.CELLLINE_NAME);

export const FORM_GENE_FILTER = {
  type: FormElementType.MAP,
  label: `Filter By`,
  id: 'filter',
  useSession: true,
  options: {
    uniqueKeys: true,
    entries: [{
      name: 'Bio Type',
      value: 'biotype',
      type: FormElementType.SELECT2,
      multiple: true,
      return: 'id',
      optionsData: cachedLazy('gene_biotypes', () => getAPIJSON(`/targid/db/${gene.db}/gene_unique_all`, {
        column: 'biotype',
        species: getSelectedSpecies()
      }).then((r) => r.map((d) => d.text)))
    }, {
      name: 'Strand',
      value: 'strand',
      type: FormElementType.SELECT2,
      multiple: true,
      return: 'id',
      optionsData: cachedLazy('gene_strands', () => getAPIJSON(`/targid/db/${gene.db}/gene_unique_all`, {
        column: 'strand',
        species: getSelectedSpecies()
      }).then((r) => r.map((d) => ({name: `${d.text === -1 ? 'reverse' : 'forward'} strand`, value: d.text}))))
    }, {
      name: 'Predefined Named Sets',
      value: 'panel',
      type: FormElementType.SELECT2,
      multiple: true,
      return: 'id',
      optionsData: cachedLazy('gene_predefined_namedsets', buildPredefinedNamedSets.bind(null, gene))
    }, {
      name: 'My Named Sets',
      value: 'namedset4c.ensg',
      type: FormElementType.SELECT2,
      multiple: true,
      return: 'id',
      optionsData: listNamedSetsAsOptions.bind(null, gene.idType)
    }, {
      name: 'Gene Symbol',
      value: 'c.ensg',
      type: FormElementType.SELECT2,
      multiple: true,
      return: 'id',
      ajax: {
        url: api2absURL(`/targid/db/${gene.db}/gene_items/lookup`),
        data: (params: any) => {
          return {
            column: 'symbol',
            species: getSelectedSpecies(),
            query: params.term,
            page: params.page
          };
        }
      },
      templateResult: (item: any) => (item.id) ? `${item.text} <span class="ensg">${item.id}</span>` : item.text,
      templateSelection: (item: any) => (item.id) ? `${item.text} <span class="ensg">${item.id}</span>` : item.text
    }]
  }
};

function generateFilter(d: IDataSourceConfig) {
  return {
    type: FormElementType.MAP,
    label: `Filter By`,
    id: 'filter',
    useSession: true,
    options: {
      uniqueKeys: true,
      entries: [{
        name: 'Tumor Type',
        value: 'tumortype',
        type: FormElementType.SELECT2,
        multiple: true,
        return: 'id',
        optionsData: cachedLazy(d.base + '_tumortypes', () => getAPIJSON(`/targid/db/${d.db}/${d.base}_unique_all`, {
          column: 'tumortype',
          species: getSelectedSpecies()
        }).then((r) => r.map((d) => d.text)))
      }, {
        name: 'Organ',
        value: 'organ',
        type: FormElementType.SELECT2,
        multiple: true,
        return: 'id',
        optionsData: cachedLazy(d.base + '_organs', () => getAPIJSON(`/targid/db/${d.db}/${d.base}_unique_all`, {
          column: 'organ',
          species: getSelectedSpecies()
        }).then((r) => r.map((d) => d.text)))
      }, {
        name: 'Gender',
        value: 'gender',
        type: FormElementType.SELECT2,
        multiple: true,
        return: 'id',
        optionsData: cachedLazy(d.base + '_gender', () => getAPIJSON(`/targid/db/${d.db}/${d.base}_unique_all`, {
          column: 'gender',
          species: getSelectedSpecies()
        }).then((r) => r.map((d) => d.text)))
      }, {
        name: 'Predefined Named Sets',
        value: 'panel',
        type: FormElementType.SELECT2,
        multiple: true,
        return: 'id',
        optionsData: cachedLazy('gene_predefined_namedsets', buildPredefinedNamedSets.bind(null, d))
      }, {
        name: 'My Named Sets',
        value: 'namedset4c.' + d.entityName,
        type: FormElementType.SELECT2,
        multiple: true,
        return: 'id',
        optionsData: listNamedSetsAsOptions.bind(null, d.idType)
      }, {
        name: d.name,
        value: 'c.' + d.entityName,
        type: FormElementType.SELECT2,
        multiple: true,
        return: 'id',
        ajax: {
          url: api2absURL(`/targid/db/${gene.db}/${d.base}_items/lookup`),
          data: (params: any) => {
            return {
              column: d.entityName,
              species: getSelectedSpecies(),
              query: params.term,
              page: params.page
            };
          }
        }
      }]
    }
  };
}

export const FORM_DATA_SOURCE = {
  type: FormElementType.SELECT,
  label: 'Data Source',
  id: ParameterFormIds.DATA_SOURCE,
  options: {
    optionsData: dataSources.map((ds) => {
      return {name: ds.name, value: ds.name, data: ds};
    })
  },
  useSession: true
};

export const FORM_TISSUE_FILTER = generateFilter(tissue);
export const FORM_CELLLINE_FILTER = generateFilter(cellline);
export const FORM_TISSUE_OR_CELLLINE_FILTER = {
  type: FormElementType.MAP,
  label: `Filter By`,
  id: 'filter',
  useSession: true,
  dependsOn: [ParameterFormIds.DATA_SOURCE],
  options: {
    entries: (dataSource: IFormElement) => {
      const value = dataSource.value.data;
      if (value === tissue || value === tissue.id) {
        return FORM_TISSUE_FILTER.options.entries;
      } else if (value === cellline || value === cellline.id) {
        return FORM_CELLLINE_FILTER.options.entries;
      }
      return [];
    }
  }
};
