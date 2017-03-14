/**
 * Created by sam on 06.03.2017.
 */

import {SPECIES_SESSION_KEY, getSelectedSpecies} from 'targid_common/src/Common';
import {FORM_EXPRESSION_SUBTYPE_ID, FORM_COPYNUMBER_SUBTYPE_ID} from 'targid_common/src/forms';
import {FormElementType} from 'ordino/src/form';
import {cachedLazy} from 'ordino/src/cached';
import {getAPIJSON, api2absURL} from 'phovea_core/src/ajax';
import {gene, IDataSourceConfig} from './config';
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

export const FORM_GENE_FILTER = {
  type: FormElementType.MAP,
  label: `Filter By`,
  id: 'filter',
  options: {
    entries: [{
      name: 'Bio Type',
      value: 'biotype',
      type: FormElementType.SELECT,
      optionsData: cachedLazy('gene_biotypes', () => getAPIJSON(`/targid/db/${gene.db}/gene_unique_all`, {
        column: 'biotype',
        species: getSelectedSpecies()
      }).then((r) => r.map((d) => d.text)))
    }, {
      name: 'Strand',
      value: 'strand',
      type: FormElementType.SELECT,
      optionsData: cachedLazy('gene_strands', () => getAPIJSON(`/targid/db/${gene.db}/gene_unique_all`, {
        column: 'strand',
        species: getSelectedSpecies()
      }).then((r) => r.map((d) => ({name: `${d.text === -1 ? 'reverse' : 'forward'} strand`, value: d.text}))))
    }, {
      name: 'Predefined Named Sets',
      value: 'panel',
      type: FormElementType.SELECT,
      optionsData: cachedLazy('gene_predefined_namedsets', buildPredefinedNamedSets.bind(null, gene))
    }, {
      name: 'My Named Sets',
      value: 'names',
      type: FormElementType.SELECT,
      optionsData: listNamedSetsAsOptions.bind(null, gene.idType)
    }, {
      name: 'Gene Symbol',
      value: 'name',
      type: FormElementType.SELECT2,
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
