/**
 * Created by Samuel Gratzl on 27.04.2016.
 */

import * as dialogs from 'phovea_ui/src/dialogs';
import {IPluginDesc} from 'phovea_core/src/plugin';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {dataTypes, IDataTypeConfig, expression, copyNumber, mutation, gene, IDataSourceConfig} from '../../config';
import {ParameterFormIds, COMPARISON_OPERATORS, MUTATION_AGGREGATION} from '../../forms';
import {IScore} from 'ordino/src/LineUpView';
import {FormBuilder, FormElementType, IFormElementDesc} from 'ordino/src/FormBuilder';
import {api2absURL, getAPIJSON} from 'phovea_core/src/ajax';
import {select} from 'd3';
import InvertedAggregatedScore from './AggregatedScore';
import InvertedFrequencyScore from './FrequencyScore';
import InvertedMutationFrequencyScore from './MutationFrequencyScore';
import InvertedSingleGeneScore from './SingleScore';
import {cachedLazy} from 'ordino/src/cached';
import {listNamedSets, listNamedSetsAsOptions} from 'ordino/src/storage';
import {convertRow2MultiMap} from 'ordino/src/form/internal/FormMap';

function buildPredefinedNamedSets(ds: IDataSourceConfig) {
  return getAPIJSON(`/targid/db/${ds.db}/${ds.base}_panel`).then((panels: {id: string}[]) => panels.map((p) => p.id));
}

export function create() {
  // resolve promise when closing or submitting the modal dialog
  return new Promise((resolve) => {
    const dialog = dialogs.generateDialog('Add Score Column', 'Add Score Column');

    const form:FormBuilder = new FormBuilder(select(dialog.body));
    const formDesc:IFormElementDesc[] = [
      {
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
            }).then((r) => r.map((d) => ({name: `${d.text === -1 ? 'reverse': 'forward'} strand`, value: d.text}))))
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
      },
      {
        type: FormElementType.SELECT,
        label: 'Data Type',
        id: ParameterFormIds.DATA_TYPE,
        options: {
          optionsData: dataTypes.map((ds) => {
            return {name: ds.name, value: ds.id, data: ds};
          })
        },
        useSession: true
      },
      {
        type: FormElementType.SELECT,
        label: 'Data Subtype',
        id: ParameterFormIds.DATA_SUBTYPE,
        dependsOn: [ParameterFormIds.DATA_TYPE],
        options: {
          optionsFnc: (selection) => {
            const r = (<IDataTypeConfig>selection[0].data).dataSubtypes;
            // TODO why -> can't aggregate strings
            //if(selection[0].value === 'bio_type') {
            //  r = r.filter((d)=>d.type !== ('string'));
            //}
            return r.map((ds) => {
              return {name: ds.name, value: ds.id, data: ds};
            });
          },
          optionsData: []
        },
        useSession: true
      },
      {
        type: FormElementType.SELECT,
        label: 'Aggregation',
        id: ParameterFormIds.AGGREGATION,
        dependsOn: [ParameterFormIds.DATA_TYPE],
        options: {
          optionsFnc: (selection) => {
            if(selection[0].data === mutation) {
              return MUTATION_AGGREGATION;
            //} else if(selection[2].name === allBioTypes) { // TODO don't get this restriction
              //return [
              //  {name: 'Count', value: 'count', data: 'count'},
              //  {name: 'Frequency', value: 'frequency', data: 'frequency'},
              //  {name: 'Min', value: 'min', data: 'min'},
              //  {name: 'Max', value: 'max', data: 'max'}
              //];
            } else {
              return [
                {name: 'Count', value: 'count', data: 'count'},
                {name: 'Frequency', value: 'frequency', data: 'frequency'},
                {name: 'Average', value: 'avg', data: 'avg'},
                {name: 'Median', value: 'median', data: 'median'},
                {name: 'Min', value: 'min', data: 'min'},
                {name: 'Max', value: 'max', data: 'max'}
              ];
            }
          },
          optionsData: []
        },
        useSession: true
      },
      {
        type: FormElementType.SELECT,
        label: 'Comparison Operator',
        id: ParameterFormIds.COMPARISON_OPERATOR,
        dependsOn: [ParameterFormIds.DATA_TYPE, ParameterFormIds.AGGREGATION],
        showIf: (dependantValues) => // show form element for expression and copy number frequencies
          ((dependantValues[1].value === 'frequency' || dependantValues[1].value === 'count')  && (dependantValues[0].data === expression || dependantValues[0].data === copyNumber)),
        options: {
          optionsData: COMPARISON_OPERATORS
        },
        useSession: true
      },
      {
        type: FormElementType.INPUT_TEXT,
        label: 'Comparison Value',
        id: ParameterFormIds.COMPARISON_VALUE,
        dependsOn: [ParameterFormIds.DATA_TYPE, ParameterFormIds.AGGREGATION],
        showIf: (dependantValues) => // show form element for expression and copy number frequencies
          ((dependantValues[1].value === 'frequency' || dependantValues[1].value === 'count') && (dependantValues[0].data === expression || dependantValues[0].data === copyNumber)),
        useSession: true
      }
    ];

    form.build(formDesc);

    dialog.onSubmit(() => {
      const data = form.getElementData();
      data.filter =  convertRow2MultiMap(data.filter);

      dialog.hide();
      resolve(data);
      return false;
    });

    dialog.onHide(() => {
      dialog.destroy();
    });

    dialog.show();
  });
}

function createInvertedAggregatedScore(data):IScore<number> {
  if(data[ParameterFormIds.AGGREGATION] === 'frequency' || data[ParameterFormIds.AGGREGATION] === 'count') {
    // boolean to indicate that the resulting score does not need to be divided by the total count
    const countOnly = data[ParameterFormIds.AGGREGATION] === 'count';
    switch(data[ParameterFormIds.DATA_TYPE]) {
      case mutation:
        return new InvertedMutationFrequencyScore(data, gene, countOnly);
      case copyNumber:
      case expression:
        return new InvertedFrequencyScore(data, gene, countOnly);
    }
  }
  return new InvertedAggregatedScore(data, gene);
}

export function createScore(data): IScore<number> {
  switch(data[ParameterFormIds.FILTER_BY]) {
    case 'single_entity':
      data.entity_value = data[ParameterFormIds.GENE_SYMBOL];
      return new InvertedSingleGeneScore(data, gene);
    default:
      return createInvertedAggregatedScore(data);
  }
}
