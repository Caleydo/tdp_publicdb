/**
 * Created by Samuel Gratzl on 27.04.2016.
 */

import * as ajax from 'phovea_core/src/ajax';
import * as ranges from 'phovea_core/src/range';
import * as dialogs from 'phovea_ui/src/dialogs';
import {IPluginDesc} from 'phovea_core/src/plugin';
import * as idtypes from 'phovea_core/src/idtype';
import {
  allBioTypes, dataTypes, IDataSourceConfig, IDataTypeConfig, IDataSubtypeConfig, ParameterFormIds,
  expression, copyNumber, mutation, gene, convertLog2ToLinear, dataSubtypes, getSelectedSpecies
} from 'targid_common/src/Common';
import {IScore} from 'ordino/src/LineUpView';
import {FormBuilder, FormElementType, IFormElementDesc} from 'ordino/src/FormBuilder';
import {api2absURL} from 'phovea_core/src/ajax';
import {createDesc} from './AggregatedGeneScore';
import {select} from 'd3';

interface ICommonScoreParam {
  data_subtype: IDataSubtypeConfig;
  bio_type: string;
}

interface IInvertedAggregatedScoreParam extends ICommonScoreParam {
  data_source: IDataSourceConfig;
  data_type: IDataTypeConfig;
  aggregation: string;
}

class InvertedAggregatedScore implements IScore<number> {
  constructor(private parameter: IInvertedAggregatedScoreParam, private dataSource: IDataSourceConfig) {
  }

  createDesc() {
    return createDesc(dataSubtypes.number, `${this.parameter.aggregation} ${this.parameter.data_subtype.name} @ ${this.parameter.bio_type}`, this.parameter.data_subtype);
  }

  async compute(ids: ranges.Range, idtype: idtypes.IDType): Promise<any[]> {
    const p = this.parameter;
    const ds = this.dataSource;
    const url = `/targid/db/${ds.db}/aggregated_score_inverted${p.bio_type === allBioTypes ? '_all' : ''}`;
    const param = {
      schema: ds.schema,
      entity_name: ds.entityName,
      table_name: p.data_type.tableName,
      data_subtype: p.data_subtype.useForAggregation,
      biotype: p.bio_type,
      agg: p.aggregation,
      species: getSelectedSpecies()
    };

    const rows: any[] = await ajax.getAPIJSON(url, param);
    if (this.parameter.data_subtype.useForAggregation.indexOf('log2') !== -1) {
      return convertLog2ToLinear(rows, 'score');
    }
    return rows;
  }
}

interface IInvertedMutationFrequencyScoreParam extends ICommonScoreParam {
  comparison_operator: string;
  comparison_value: number;
}

class InvertedMutationFrequencyScore implements IScore<number> {
  constructor(private parameter: IInvertedMutationFrequencyScoreParam, private dataSource: IDataSourceConfig, private countOnly) {

  }

  createDesc() {
    const subtype = this.parameter.data_subtype;
    return createDesc(dataSubtypes.number, `${subtype.name} ${this.countOnly ? 'Count' : 'Frequency'} ${this.parameter.bio_type === allBioTypes ? '' : '@ '+this.parameter.bio_type}`, subtype);
  }

  async compute(ids:ranges.Range, idtype:idtypes.IDType):Promise<any[]> {
    const url = `/targid/db/${this.dataSource.db}/mutation_frequency_inverted${this.parameter.bio_type===allBioTypes ? '_all' : ''}`;
    const param = {
        schema: this.dataSource.schema,
        entity_name: this.dataSource.entityName,
        data_subtype: this.parameter.data_subtype.useForAggregation,
        biotype: this.parameter.bio_type,
        species: getSelectedSpecies()
      };

    const rows = await ajax.getAPIJSON(url, param);
    rows.forEach((row) => this.countOnly ? row.count : row.count / row.total);
    return rows;
  }
}

interface IInvertedFrequencyScoreParam extends ICommonScoreParam {
  data_type:IDataTypeConfig;
  comparison_operator: string;
  comparison_value: number;
}

class InvertedFrequencyScore implements IScore<number> {
  constructor(private parameter: IInvertedFrequencyScoreParam, private dataSource: IDataSourceConfig, private countOnly) {

  }

  createDesc() {
    const subtype = this.parameter.data_subtype;
    return createDesc(dataSubtypes.number, `${subtype.name} ${this.parameter.comparison_operator} ${this.parameter.comparison_value} ${this.countOnly ? 'Count' : 'Frequency'}  ${this.parameter.bio_type === allBioTypes ? '' : '@ '+this.parameter.bio_type}`, subtype);
  }

  async compute(ids:ranges.Range, idtype:idtypes.IDType):Promise<any[]> {
    const url = `/targid/db/${this.dataSource.db}/frequency_score_inverted${this.parameter.bio_type===allBioTypes ? '_all' : ''}`;
    const param = {
        schema: this.dataSource.schema,
        entity_name: this.dataSource.entityName,
        table_name: this.parameter.data_type.tableName,
        data_subtype: this.parameter.data_subtype.useForAggregation,
        biotype: this.parameter.bio_type,
        operator: this.parameter.comparison_operator,
        value: this.parameter.comparison_value,
        species: getSelectedSpecies()
      };

    const rows = await ajax.getAPIJSON(url, param);
    rows.forEach((row) => row.score = this.countOnly ? row.count : row.count / row.total);
    return rows;
  }
}

interface IInvertedSingleGeneScore extends ICommonScoreParam {
  data_type:IDataTypeConfig;
  data_source: IDataSourceConfig;
  tumor_type: string;
  aggregation: string;
  entity_value: {id: string, text: string};
}

class InvertedSingleGeneScore implements IScore<any> {
  constructor(private parameter: IInvertedSingleGeneScore, private dataSource: IDataSourceConfig) {

  }

  createDesc(): any {
    const subtype = this.parameter.data_subtype;
    return createDesc(subtype.type, `${this.parameter.data_subtype.name} of ${this.parameter.entity_value.text}`, subtype);
  }

  async compute(ids:ranges.Range, idtype:idtypes.IDType):Promise<any[]> {
    const url = `/targid/db/${this.dataSource.db}/single_entity_score_inverted`;
    const param = {
        schema: this.dataSource.schema,
        entity_name: this.dataSource.entityName,
        table_name: this.parameter.data_type.tableName,
        data_subtype: this.parameter.data_subtype.id,
        entity_value: this.parameter.entity_value.id,
        species: getSelectedSpecies()
      };

    const rows: any[] = await ajax.getAPIJSON(url, param);
    if (this.parameter.data_subtype.useForAggregation.indexOf('log2') !== -1) {
      return convertLog2ToLinear(rows, 'score');
    }
    return rows;
  }
}

export function create(desc: IPluginDesc, dataSource:IDataSourceConfig = gene) {
  // resolve promise when closing or submitting the modal dialog
  return new Promise((resolve) => {
    const dialog = dialogs.generateDialog('Add Score Column', 'Add Score Column');

    const form:FormBuilder = new FormBuilder(select(dialog.body));
    const formDesc:IFormElementDesc[] = [
      {
        type: FormElementType.SELECT,
        label: 'Data Source',
        id: ParameterFormIds.DATA_SOURCE,
        visible: false,
        options: {
          optionsData: [dataSource].map((ds) => {
            return {name: ds.name, value: ds.name, data: ds};
          })
        },
        useSession: true
      },
      {
        type: FormElementType.SELECT,
        label: `Filter By`,
        id: ParameterFormIds.FILTER_BY,
        options: {
          optionsData: [
            {name: 'Bio Type', value:'bio_type', data:'bio_type'},
            {name: 'Single Gene', value:'single_entity', data:'single_entity'}
          ]
        },
        useSession: true
      },
      {
        type: FormElementType.SELECT2,
        label: 'Gene Symbol',
        id: ParameterFormIds.GENE_SYMBOL,
        dependsOn: [ParameterFormIds.FILTER_BY],
        showIf: (dependantValues) => (dependantValues[0].value === 'single_entity'),
        attributes: {
          style: 'width:100%'
        },
        options: {
          optionsData: [],
          ajax: {
            url: api2absURL(`/targid/db/${dataSource.db}/single_entity_lookup/lookup`),
            data: (params:any) => {
              return {
                schema: gene.schema, // use `gene` explicitly as datasource
                table_name: gene.tableName,
                id_column: gene.entityName,
                species: getSelectedSpecies(),
                query_column: 'symbol',
                query: params.term,
                page: params.page
              };
            }
          },
          templateResult: (item:any) => (item.id) ? `${item.text} <span class="ensg">${item.id}</span>` : item.text,
          templateSelection: (item:any) => (item.id) ? `${item.text} <span class="ensg">${item.id}</span>` : item.text
        },
        useSession: true
      },
      {
        type: FormElementType.SELECT,
        label: 'Bio Type',
        id: ParameterFormIds.BIO_TYPE,
        dependsOn: [ParameterFormIds.FILTER_BY, ParameterFormIds.DATA_SOURCE],
        showIf: (dependantValues) => (dependantValues[0].value === 'bio_type'),
        options: {
          optionsFnc: (selection) => gene.bioTypesWithAll.map((d) => {
            return {name: d, value: d, data: d};
          }),
          optionsData: []
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
            if(selection[0].value === 'bio_type') {
              r = r.filter((d)=>d.type !== ('string'));
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
        dependsOn: [ParameterFormIds.FILTER_BY, ParameterFormIds.DATA_TYPE, ParameterFormIds.BIO_TYPE],
        showIf: (dependantValues) => (dependantValues[0].value === 'bio_type'),
        options: {
          optionsFnc: (selection) => {
            let r = [];
            if(selection[1].data === mutation) {
              r = [
                {name: 'Frequency', value: 'frequency', data: 'frequency'},
                {name: 'Count', value: 'count', data: 'count'}
              ];

            } else if(selection[2].name === allBioTypes) {
              r = [
                {name: 'Count', value: 'count', data: 'count'},
                {name: 'Frequency', value: 'frequency', data: 'frequency'},
                {name: 'Min', value: 'min', data: 'min'},
                {name: 'Max', value: 'max', data: 'max'}
              ];

            } else {
              r = [
                {name: 'Count', value: 'count', data: 'count'},
                {name: 'Frequency', value: 'frequency', data: 'frequency'},
                {name: 'Average', value: 'avg', data: 'avg'},
                {name: 'Median', value: 'median', data: 'median'},
                {name: 'Min', value: 'min', data: 'min'},
                {name: 'Max', value: 'max', data: 'max'}
              ];
            }

            return r;
          },
          optionsData: []
        },
        useSession: true
      },
      {
        type: FormElementType.SELECT,
        label: 'Comparison Operator',
        id: ParameterFormIds.COMPARISON_OPERATOR,
        dependsOn: [ParameterFormIds.DATA_TYPE, ParameterFormIds.AGGREGATION, ParameterFormIds.FILTER_BY],
        showIf: (dependantValues) => // show form element for expression and copy number frequencies
          (dependantValues[2].value === 'bio_type' && (dependantValues[1].value === 'frequency' || dependantValues[1].value === 'count')  && (dependantValues[0].data === expression || dependantValues[0].data === copyNumber)),
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
        dependsOn: [ParameterFormIds.DATA_TYPE, ParameterFormIds.AGGREGATION, ParameterFormIds.FILTER_BY],
        showIf: (dependantValues) => // show form element for expression and copy number frequencies
          (dependantValues[2].value === 'bio_type' && (dependantValues[1].value === 'frequency' || dependantValues[1].value === 'count') && (dependantValues[0].data === expression || dependantValues[0].data === copyNumber)),
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

function createInvertedSingleGeneScore(data):IScore<number> {
  return new InvertedSingleGeneScore(data, data[ParameterFormIds.DATA_SOURCE]);
}

function createInvertedAggregatedScore(data):IScore<number> {
  if(data[ParameterFormIds.AGGREGATION] === 'frequency' || data[ParameterFormIds.AGGREGATION] === 'count') {
    // boolean to indicate that the resulting score does not need to be divided by the total count
    const countOnly = data[ParameterFormIds.AGGREGATION] === 'count';
    switch(data[ParameterFormIds.DATA_TYPE]) {
      case mutation:
        return new InvertedMutationFrequencyScore(data, data[ParameterFormIds.DATA_SOURCE], countOnly);
      case copyNumber:
      case expression:
        return new InvertedFrequencyScore(data, data[ParameterFormIds.DATA_SOURCE], countOnly);
    }
  }
  return new InvertedAggregatedScore(data, data[ParameterFormIds.DATA_SOURCE]);
}

export function createScore(data): IScore<number> {
  switch(data[ParameterFormIds.FILTER_BY]) {
    case 'single_entity':
      data.entity_value = data[ParameterFormIds.GENE_SYMBOL];
      return createInvertedSingleGeneScore(data);
    default:
      return createInvertedAggregatedScore(data);
  }
}
