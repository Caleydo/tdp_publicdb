/**
 * Created by sam on 06.03.2017.
 */

import {SPECIES_SESSION_KEY} from 'targid_common/src/Common';
import {FORM_EXPRESSION_SUBTYPE_ID, FORM_COPYNUMBER_SUBTYPE_ID} from 'targid_common/src/forms';

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
