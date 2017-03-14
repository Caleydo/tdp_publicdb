/**
 * Created by Samuel Gratzl on 27.04.2016.
 */

import * as ajax from 'phovea_core/src/ajax';
import * as dialogs from 'phovea_ui/src/dialogs';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {
  dataSources, dataTypes, IDataTypeConfig, expression, copyNumber, mutation, cellline, dataSubtypes, tissue
} from '../../config';
import {ParameterFormIds, COMPARISON_OPERATORS, NUMERIC_AGGREGATION, MUTATION_AGGREGATION} from '../../forms';
import {IScore} from 'ordino/src/LineUpView';
import {FormBuilder, FormElementType, IFormElementDesc} from 'ordino/src/FormBuilder';
import {IBoxPlotData} from 'lineupjs/src/model/BoxPlotColumn';
import {api2absURL} from 'phovea_core/src/ajax';
import {select} from 'd3';
import SingleEntityScore from './SingleGeneScore';
import BoxScore from './BoxScore';
import MutationFrequencyScore from './MutationFrequencyScore';
import AggregatedScore from './AggregatedScore';
import FrequencyScore from './FrequencyScore';
import {IPluginDesc} from 'phovea_core/src/plugin';


function listTissuePanels(): Promise<{id: string}[]> {
  const ds = tissue;
  const baseURL = `/targid/db/${ds.db}/${ds.base}_panel`;
  return ajax.getAPIJSON(baseURL);
}

function choose(desc: IPluginDesc) {
  // TODO
  return dataSources[0];
}

export async function create(desc: IPluginDesc) {
  const ds = choose(desc);
  return new Promise((resolve) => {
    const dialog = dialogs.generateDialog('Add Score Column', 'Add Score Column');

    const form: FormBuilder = new FormBuilder(select(dialog.body));
    const formDesc: IFormElementDesc[] = [
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
            value: 'ids',
            type: FormElementType.SELECT,
            optionsData: buildMyNamedSets.bind(null, gene)
          }, {
            name: 'Gene Symbol',
            value: 'id',
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
        type: FormElementType.SELECT2,
        label: 'Cell Line Name',
        id: ParameterFormIds.CELLLINE_NAME,
        dependsOn: [ParameterFormIds.FILTER_BY],
        showIf: (dependantValues) => (dependantValues[0].value === 'single_cellline'),
        attributes: {
          style: 'width:100%'
        },
        options: {
          optionsData: [],
          ajax: {
            url: api2absURL(`/targid/db/${dataSources[0].db}/single_entity_lookup/lookup`),
            data: (params: any) => {
              return {
                schema: dataSources[0].schema,
                table_name: dataSources[0].tableName,
                id_column: dataSources[0].entityName,
                query_column: dataSources[0].entityName,
                species: getSelectedSpecies(),
                query: params.term,
                page: params.page
              };
            }
          }
        },
        useSession: true
      },
      {
        type: FormElementType.SELECT2,
        label: 'Tissue Name',
        id: ParameterFormIds.TISSUE_NAME,
        dependsOn: [ParameterFormIds.FILTER_BY],
        showIf: (dependantValues) => (dependantValues[0].value === 'single_tissue'),
        attributes: {
          style: 'width:100%'
        },
        options: {
          optionsData: [],
          ajax: {
            url: api2absURL(`/targid/db/${dataSources[1].db}/single_entity_lookup/lookup`),
            data: (params: any) => {
              return {
                schema: dataSources[1].schema,
                table_name: dataSources[1].tableName,
                id_column: dataSources[1].entityName,
                query_column: dataSources[1].entityName,
                query: params.term,
                page: params.page
              };
            }
          }
        },
        useSession: true
      },
      {
        type: FormElementType.SELECT,
        label: 'Tumor Type',
        id: ParameterFormIds.TUMOR_TYPE,
        dependsOn: [ParameterFormIds.FILTER_BY, ParameterFormIds.DATA_SOURCE],
        showIf: (dependantValues) => (dependantValues[0].value === 'tumor_type'),
        options: {
          optionsFnc: (selection) => selection[1].data.tumorTypesWithAll,
          optionsData: [],
        },
        useSession: true
      },
      {
        type: FormElementType.SELECT,
        label: 'Panel Name',
        id: ParameterFormIds.TISSUE_PANEL_NAME,
        dependsOn: [ParameterFormIds.FILTER_BY, ParameterFormIds.DATA_SOURCE],
        showIf: (dependantValues) => (dependantValues[0].value === 'tissue_panel'),
        options: {
          optionsData: tissuePanels.map((p) => ({name: p.id, value: p.id, data: p.id}))
        },
        useSession: true
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
        dependsOn: [ParameterFormIds.FILTER_BY, ParameterFormIds.DATA_TYPE],
        options: {
          optionsFnc: (selection) => {
            let r = (<IDataTypeConfig>selection[1].data).dataSubtypes;
            if (selection[0].value === 'tumor_type') {
              r = r.filter((d) => d.type !== dataSubtypes.string); //no strings allowed
            }
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
        dependsOn: [ParameterFormIds.FILTER_BY, ParameterFormIds.DATA_TYPE],
        showIf: (dependantValues) => (dependantValues[0].value === 'tumor_type'),
        options: {
          optionsFnc: (selection) => {
            if (selection[1].data === mutation) {
              return MUTATION_AGGREGATION;
            }
            return NUMERIC_AGGREGATION;
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
          ((dependantValues[1].value === 'frequency' || dependantValues[1].value === 'count') && (dependantValues[0].data === expression || dependantValues[0].data === copyNumber)),
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

function createSingleEntityScore(data): IScore<number> {
  return new SingleEntityScore(data, data[ParameterFormIds.DATA_SOURCE]);
}

function createAggregatedScore(data): IScore<number|IBoxPlotData> {
  const aggregation = data[ParameterFormIds.AGGREGATION];
  if (aggregation === 'boxplot') {
    return new BoxScore(data, data[ParameterFormIds.DATA_SOURCE]);
  } else if (aggregation === 'frequency' || aggregation === 'count') {
    // boolean to indicate that the resulting score does not need to be divided by the total count
    const countOnly = aggregation === 'count';
    switch (data[ParameterFormIds.DATA_TYPE]) {
      case mutation:
        return new MutationFrequencyScore(data, data[ParameterFormIds.DATA_SOURCE], countOnly);
      case copyNumber:
      case expression:
        return new FrequencyScore(data, data[ParameterFormIds.DATA_SOURCE], countOnly);
    }
  }
  return new AggregatedScore(data, data[ParameterFormIds.DATA_SOURCE]);
}

export function createScore(data: any) {
  switch (data[ParameterFormIds.FILTER_BY]) {
    case 'single_cellline':
      data.entity_value = data[ParameterFormIds.CELLLINE_NAME];
      return createSingleEntityScore(data);
    case 'single_tissue':
      data.entity_value = data[ParameterFormIds.TISSUE_NAME];
      return createSingleEntityScore(data);
    default:
      return createAggregatedScore(data);
  }
}
