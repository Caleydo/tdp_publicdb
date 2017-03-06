/**
 * Created by sam on 06.03.2017.
 */

import {defaultSpecies} from 'targid_common/src/Common';
import {IDataSourceConfig} from '../config';
import {ParameterFormIds} from '../forms';
import {INamedSet, ENamedSetType} from 'ordino/src/storage';
import {getAPIJSON} from 'phovea_core/src/ajax';
import * as session from 'phovea_core/src/session';
import {IViewContext, ISelection} from 'ordino/src/View';
import {ALineUpView2} from 'ordino/src/LineUpView';
import {FormBuilder, IFormSelectDesc, FormElementType} from 'ordino/src/FormBuilder';


export interface IACommonListOptions {
  namedSet?: INamedSet;
  search?: { id: string, type: string };
}

export abstract class ACommonList extends ALineUpView2 {

  /**
   * Initialize LineUp view with named set
   * Override in constructor of extended class
   */
  private namedSet : INamedSet;
  private search: { id: string, type: string };

  /**
   * Parameter UI form
   */
  private paramForm:FormBuilder;

  constructor(context:IViewContext, selection: ISelection, parent:Element, private dataSource: IDataSourceConfig, options: IACommonListOptions) {
    super(context, selection, parent, options);

    //this.idAccessor = (d) => d._id;
    this.additionalScoreParameter = dataSource;
    this.namedSet = options.namedSet;
    if(!this.namedSet) { this.search = options.search; }
  }

  buildParameterUI($parent: d3.Selection<any>, onChange: (name: string, value: any)=>Promise<any>) {
    this.paramForm = new FormBuilder($parent);

    const paramDesc:IFormSelectDesc[] = [
      {
        type: FormElementType.SELECT,
        label: 'Data Source',
        id: ParameterFormIds.DATA_SOURCE,
        visible: false,
        options: {
          optionsData: [this.dataSource].map((ds) => {
            return {name: ds.name, value: ds.name, data: ds};
          })
        }
      }
    ];

    // map FormElement change function to provenance graph onChange function
    paramDesc.forEach((p) => {
      p.options.onChange = (selection, formElement) => onChange(formElement.id, selection.value);
    });

    this.paramForm.build(paramDesc);

    // add other fields
    super.buildParameterUI($parent.select('form'), onChange);
  }

  getParameter(name: string): any {
    return this.paramForm.getElementById(name).value.data;
  }

  setParameter(name: string, value: any) {
    this.paramForm.getElementById(name).value = value;
    this.clear();
    return this.update();
  }

  /**
   * Get sub type for named sets
   * @returns {{key: string, value: string}}
   */
  protected getSubType() {
    return {
      key: this.namedSet.subTypeKey,
      value: this.namedSet.subTypeValue
    };
  }

  protected loadColumnDesc() {
    const dataSource = this.getParameter(ParameterFormIds.DATA_SOURCE);
    return getAPIJSON(`/targid/db/${dataSource.db}/${dataSource.base}/desc`);
  }

  protected abstract defineColumns(desc: any) : any[];

  protected initColumns(desc) {
    super.initColumns(desc);

    const columns = this.defineColumns(desc);

    this.build([], columns);
    return columns;
  }

  protected loadRows() {
    const dataSource = this.getParameter(ParameterFormIds.DATA_SOURCE);
    let predefinedUrl: string;
    const param: any = {};

    let baseURL: string;

    if(this.namedSet) {
      switch(this.namedSet.type) {
        case ENamedSetType.NAMEDSET:
          predefinedUrl = `/namedset/${this.namedSet.id}`;
          break;
        case ENamedSetType.PANEL:
          predefinedUrl = '_panel';
          param.panel = this.namedSet.id;
          break;
        default:
          predefinedUrl = '';
          break;
      }

        // add filtered options
      let filteredUrl = '';

      if(this.namedSet.subTypeKey && this.namedSet.subTypeKey !== '' && this.namedSet.subTypeValue !== 'all') {
        if(this.namedSet.subTypeFromSession) {
          param[this.namedSet.subTypeKey] = session.retrieve(this.namedSet.subTypeKey, this.namedSet.subTypeValue);

        } else {
          param[this.namedSet.subTypeKey] = this.namedSet.subTypeValue;
        }

        filteredUrl = '_filtered';
      }
      baseURL = `/targid/db/${dataSource.db}/${dataSource.base}${filteredUrl}${predefinedUrl}`;
    } else if(this.search) {
      param.schema = dataSource.schema;
      param.table_name = dataSource.tableName;
      param.species = defaultSpecies;
      param.entity_name = dataSource.entityName;
      param.name = this.search.id;

      baseURL = `/targid/db/${dataSource.db}/${this.search.type}_single_row`;
    }

    return getAPIJSON(baseURL, param);
  }

  getItemName(count) {
    const dataSource = this.getParameter(ParameterFormIds.DATA_SOURCE);
    return (count === 1) ? dataSource.name.toLowerCase() : dataSource.name.toLowerCase() + 's';
  }
}
