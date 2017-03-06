/**
 * Created by Samuel Gratzl on 27.04.2016.
 */

import * as ajax from 'phovea_core/src/ajax';
import * as ranges from 'phovea_core/src/range';
import * as dialogs from 'phovea_ui/src/dialogs';
import {IPluginDesc} from 'phovea_core/src/plugin';
import * as idtypes from 'phovea_core/src/idtype';
import {
  allTypes, dataSources, dataTypes, IDataSourceConfig, IDataTypeConfig, IDataSubtypeConfig, ParameterFormIds,
  expression, copyNumber, mutation, convertLog2ToLinear, cellline, dataSubtypes, getSelectedSpecies, tissue
} from 'targid_common/src/Common';
import {IScore, IScoreRow} from 'ordino/src/LineUpView';
import {FormBuilder, FormElementType, IFormElementDesc} from 'ordino/src/FormBuilder';
import {IBoxPlotData} from 'lineupjs/src/model/BoxPlotColumn';
import {api2absURL} from 'phovea_core/src/ajax';
import {select} from 'd3';

/**
 * creates a lineup config out of a IDataSubtypeConfig
 * @param type force a specific type
 * @param label the column label
 * @param subtype specific infos
 * @return {any}
 */
export function createDesc(type: string, label: string, subtype: IDataSubtypeConfig): any {
  switch (type) {
    case dataSubtypes.cat:
      return {
        type: 'categorical',
        label,
        categories: subtype.categories,
        missingValue: subtype.missingCategory,
        lazyLoaded: true
      };
    case dataSubtypes.string:
      return {
        type: 'string',
        label,
        lazyLoaded: true
      };
    case dataSubtypes.boxplot:
      return {
        type: 'boxplot',
        label,
        domain: [1, 100],
        lazyLoaded: true,
        missingValue: <IBoxPlotData>{
          min: 0,
          max: 0,
          median: 0,
          q1: 0,
          q3: 0
        },
      };
    default:
      return {
        type: 'number',
        label,
        domain: subtype.domain,
        missingValue: subtype.missingValue,
        lazyLoaded: true
      };
  }
}

interface IAggregatedScoreParameter {
  data_source: IDataSourceConfig;
  data_type: IDataTypeConfig;
  data_subtype: IDataSubtypeConfig;
  aggregation: string;

  filter_by: string; //tumor_type vs panel
  tumor_type?: string;
  tissue_panel_name?: string;
}

class AggregatedScore implements IScore<number> {
  constructor(private parameter: IAggregatedScoreParameter, private dataSource: IDataSourceConfig) {

  }

  createDesc() {
    const subset = this.parameter.filter_by === 'tissue_panel' ? this.parameter.tissue_panel_name : this.parameter.tumor_type;
    return createDesc(dataSubtypes.number, `${this.parameter.aggregation} ${this.parameter.data_subtype.name} @ ${subset}`, this.parameter.data_subtype);
  }

  async compute(ids: ranges.Range, idtype: idtypes.IDType): Promise<any[]> {
    const param: any = {
      schema: this.dataSource.schema,
      entity_name: this.dataSource.entityName,
      table_name: this.parameter.data_type.tableName,
      data_subtype: this.parameter.data_subtype.useForAggregation,
      agg: this.parameter.aggregation
    };


    let url = `/targid/db/${this.dataSource.db}/aggregated_score`;
    switch (this.parameter.filter_by) {
      case 'tissue_panel':
        url += '_panel';
        param.panel = this.parameter.tissue_panel_name;
        break;
      default:
        param.species = getSelectedSpecies();
        if (this.parameter.tumor_type === allTypes) {
          url += '_all';
        } else {
          param.tumortype = this.parameter.tumor_type;
        }
    }

    const rows: any[] = await ajax.getAPIJSON(url, param);
    // convert log2 to linear scale
    if (this.parameter.data_subtype.useForAggregation.indexOf('log2') !== -1) {
      return convertLog2ToLinear(rows, 'score');
    }
    return rows;
  }
}

class BoxScore implements IScore<IBoxPlotData> {
  constructor(private parameter: IAggregatedScoreParameter, private dataSource: IDataSourceConfig) {

  }

  createDesc() {
    const subset = this.parameter.filter_by === 'tissue_panel' ? this.parameter.tissue_panel_name : this.parameter.tumor_type;
    return createDesc(dataSubtypes.boxplot, `${this.parameter.aggregation} ${this.parameter.data_subtype.name} @ ${subset}`, this.parameter.data_subtype);
  }

  async compute(ids: ranges.Range, idtype: idtypes.IDType): Promise<IScoreRow<IBoxPlotData>[]> {
    const param: any = {
      schema: this.dataSource.schema,
      entity_name: this.dataSource.entityName,
      table_name: this.parameter.data_type.tableName,
      data_subtype: this.parameter.data_subtype.useForAggregation,
      agg: this.parameter.aggregation
    };

    let url = `/targid/db/${this.dataSource.db}/aggregated_score_boxplot`;
    switch (this.parameter.filter_by) {
      case 'tissue_panel':
        url += '_panel';
        param.panel = this.parameter.tissue_panel_name;
        break;
      default:
        param.species = getSelectedSpecies();
        if (this.parameter.tumor_type === allTypes) {
          url += '_all';
        } else {
          param.tumortype = this.parameter.tumor_type;
        }
    }

    const rows: any[] = await ajax.getAPIJSON(url, param);
    return rows.map((d) => ({ id: d.id, score: d}));
  }
}


class MutationFrequencyScore implements IScore<number> {
  constructor(private parameter: {
    tumor_type: string,
    data_subtype: IDataSubtypeConfig,
    comparison_operator: string,
    comparison_value: number
  },
              private dataSource: IDataSourceConfig,
              private countOnly) {

  }

  createDesc(): any {
    const subtype = this.parameter.data_subtype;
    const label = `${subtype.name} ${this.countOnly ? 'Count' : 'Frequency'} ${this.parameter.tumor_type === allTypes ? '' : '@ ' + this.parameter.tumor_type}`;
    //always a number
    return createDesc(dataSubtypes.number, label, subtype);
  }

  compute(ids: ranges.Range, idtype: idtypes.IDType): Promise<any[]> {
    const url = `/targid/db/${this.dataSource.db}/mutation_frequency${this.parameter.tumor_type === allTypes ? '_all' : ''}`;
    const param = {
      schema: this.dataSource.schema,
      entity_name: this.dataSource.entityName,
      data_subtype: this.parameter.data_subtype.useForAggregation,
      tumortype: this.parameter.tumor_type,
      species: getSelectedSpecies()
    };

    return ajax.getAPIJSON(url, param)
      .then((rows: any[]) => {
        return rows.map((row) => {
          row.score = this.countOnly ? row.count : row.count / row.total;
          return row;
        });
      });
  }
}


class FrequencyScore implements IScore<number> {
  constructor(private parameter: {
    data_type: IDataTypeConfig,
    data_subtype: IDataSubtypeConfig,
    tumor_type: string,
    comparison_operator: string,
    comparison_value: number
  },
              private dataSource: IDataSourceConfig,
              private countOnly) {

  }

  createDesc(): any {
    const subtype = this.parameter.data_subtype;
    const label = `${subtype.name} ${this.parameter.comparison_operator} ${this.parameter.comparison_value} ${this.countOnly ? 'Count' : 'Frequency'}  ${this.parameter.tumor_type === allTypes ? '' : '@ ' + this.parameter.tumor_type}`;
    return createDesc(dataSubtypes.number, label, subtype);
  }

  compute(ids: ranges.Range, idtype: idtypes.IDType): Promise<any[]> {
    const url = `/targid/db/${this.dataSource.db}/frequency_score${this.parameter.tumor_type === allTypes ? '_all' : ''}`;
    const param = {
      schema: this.dataSource.schema,
      entity_name: this.dataSource.entityName,
      table_name: this.parameter.data_type.tableName,
      data_subtype: this.parameter.data_subtype.useForAggregation,
      tumortype: this.parameter.tumor_type,
      operator: this.parameter.comparison_operator,
      value: this.parameter.comparison_value,
      species: getSelectedSpecies()
    };

    return ajax.getAPIJSON(url, param)
      .then((rows: any[]) => {
        return rows.map((row) => {
          row.score = this.countOnly ? row.count : row.count / row.total;
          return row;
        });
      });
  }
}

interface ISingleEntityScoreInterface {
  data_source: IDataSourceConfig;
  data_type: IDataTypeConfig;
  data_subtype: IDataSubtypeConfig;
  entity_value: {id: string, text: string};
}

class SingleEntityScore implements IScore<any> {
  constructor(private parameter: ISingleEntityScoreInterface, private dataSource: IDataSourceConfig) {

  }

  createDesc(): any {
    const subtype = this.parameter.data_subtype;
    return createDesc(subtype.type, `${subtype.name} of ${this.parameter.entity_value.text}`, subtype);
  }

  async compute(ids: ranges.Range, idtype: idtypes.IDType): Promise<any[]> {
    const url = `/targid/db/${this.dataSource.db}/single_entity_score`;
    const param = {
      schema: this.dataSource.schema,
      entity_name: this.dataSource.entityName,
      table_name: this.parameter.data_type.tableName,
      data_subtype: this.parameter.data_subtype.id,
      entity_value: this.parameter.entity_value.id,
      species: getSelectedSpecies()
    };

    const rows: any[] = await ajax.getAPIJSON(url, param);
    // convert log2 to linear scale
    if (this.parameter.data_subtype.useForAggregation.indexOf('log2') !== -1) {
      return convertLog2ToLinear(rows, 'score');
    }
    return rows;
  }
}

function listTissuePanels(): Promise<{id: string}[]> {
  const ds = tissue;
  const baseURL = `/targid/db/${ds.db}/${ds.base}_panel`;
  return ajax.getAPIJSON(baseURL);
}

export async function create(desc: IPluginDesc) {
  // resolve promise when closing or submitting the modal dialog
  const tissuePanels: {id: string}[] = await listTissuePanels();
  return new Promise((resolve) => {
    const dialog = dialogs.generateDialog('Add Score Column', 'Add Score Column');

    const form: FormBuilder = new FormBuilder(select(dialog.body));
    const formDesc: IFormElementDesc[] = [
      {
        type: FormElementType.SELECT,
        label: 'Data Source',
        id: ParameterFormIds.DATA_SOURCE,
        options: {
          optionsData: dataSources.map((ds) => {
            return {name: ds.name, value: ds.name, data: ds};
          })
        },
        useSession: true
      },
      {
        type: FormElementType.SELECT,
        label: `Filter By`,
        id: ParameterFormIds.FILTER_BY,
        dependsOn: [ParameterFormIds.DATA_SOURCE],
        options: {
          optionsFnc: (selection) => {
            if (selection[0].data === cellline) {
              return [
                {name: 'Tumor Type', value: 'tumor_type', data: 'tumor_type'},
                {name: `Single ${selection[0].data.name}`, value: `single_cellline`, data: `single_cellline`}
              ];
            }
            return [
              {name: 'Tumor Type', value: 'tumor_type', data: 'tumor_type'},
              {name: 'Panel', value: 'tissue_panel', data: 'tissue_panel'},
              {name: `Single ${selection[0].data.name}`, value: `single_tissue`, data: `single_tissue`}
            ];
          },
          optionsData: [],
        },
        useSession: true
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
              return [
                {name: 'Frequency', value: 'frequency', data: 'frequency'},
                {name: 'Count', value: 'count', data: 'count'}
              ];
            }
            return [
              {name: 'Average', value: 'avg', data: 'avg'},
              {name: 'Median', value: 'median', data: 'median'},
              {name: 'Min', value: 'min', data: 'min'},
              {name: 'Max', value: 'max', data: 'max'},
              {name: 'Frequency', value: 'frequency', data: 'frequency'},
              {name: 'Count', value: 'count', data: 'count'},
              {name: 'Boxplot', value: 'boxplot', data: 'boxplot'}
            ];
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
          optionsData: [
            {name: '&lt; less than', value: '<', data: '<'},
            {name: '&lt;= less equal', value: '<=', data: '<='},
            {name: 'not equal to', value: '<>', data: '<>'},
            {name: '&gt;= greater equal', value: '>=', data: '>='},
            {name: '&gt; greater than', value: '>', data: '>'}
          ]
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
