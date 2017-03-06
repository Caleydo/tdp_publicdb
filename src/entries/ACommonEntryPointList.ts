/**
 * Created by Holger Stitz on 10.08.2016.
 */

import {IPluginDesc} from 'phovea_core/src/plugin';
import {AEntryPointList, IEntryPointOptions} from 'ordino/src/StartMenu';
import {ParameterFormIds, defaultSpecies, IDataSourceConfig, getSelectedSpecies} from 'phovea_common/src/Common';
import {INamedSet, ENamedSetType} from 'ordino/src/storage';
import {getAPIJSON, api2absURL} from 'phovea_core/src/ajax';
import * as session from 'phovea_core/src/session';
import {IViewContext, ISelection} from 'ordino/src/View';
import {ALineUpView2} from 'ordino/src/LineUpView';
import {FormBuilder, IFormSelectDesc, FormElementType} from 'ordino/src/FormBuilder';
import {TargidConstants} from 'ordino/src/Targid';

export abstract class ACommonEntryPointList extends AEntryPointList {

  /**
   * Set the idType and the default data and build the list
   * @param parent
   * @param desc
   * @param options
   */
  constructor(protected parent: HTMLElement, public desc: IPluginDesc, private dataSource: IDataSourceConfig, protected options: IEntryPointOptions) {
    super(parent, desc, options);

    this.idType = dataSource.idType;


    // convert species to namedset
    this.data.unshift(<INamedSet>{
      name: 'All',
      type: ENamedSetType.CUSTOM,
      subTypeKey: ParameterFormIds.SPECIES,
      subTypeFromSession: true,
      subTypeValue: defaultSpecies,

      description: '',
      idType: '',
      ids: '',
      creator: ''
    });

    const startMenu = this.build();
    startMenu.then(() => this.addSearchField());
  }

  private static panel2NamedSet({id, description}: {id: string, description: string}): INamedSet {
    return {
      type: ENamedSetType.PANEL,
      id,
      name: id,
      description,

      subTypeKey: ParameterFormIds.SPECIES,
      subTypeFromSession: true,
      subTypeValue: defaultSpecies,
      idType: '',
      ids: '',
      creator: ''
    };
  }

  protected loadPanels(): Promise<INamedSet[]> {
    const baseURL = `/targid/db/${this.dataSource.db}/${this.dataSource.base}_panel`;
    return getAPIJSON(baseURL).then((panels: {id: string, description: string}[]) => {
      return panels.map(ACommonEntryPointList.panel2NamedSet);
    });
  }

  protected getNamedSets(): Promise<INamedSet[]> {
    return Promise.all([this.loadPanels(), super.getNamedSets()])
      .then((sets: INamedSet[][]) => [].concat(...sets));
  }

  private addSearchField() {
    const $searchWrapper = this.$node.insert('div', ':first-child').attr('class', 'startMenuSearch');

    const formBuilder: FormBuilder = new FormBuilder($searchWrapper);
    formBuilder.appendElement({
      id: `search-${this.dataSource.entityName}`,
      hideLabel: true,
      type: FormElementType.SELECT2,
      attributes: {
        style: 'width:100%',
      },
      options: {
        optionsData: [],
        placeholder: `Search ${this.dataSource.name}`,
        ajax: {
          url: api2absURL(`/targid/db/${this.dataSource.db}/single_entity_lookup/lookup`),
          data: (params: any) => {
            return {
              schema: this.dataSource.schema,
              table_name: this.dataSource.tableName,
              id_column: this.dataSource.entityName,
              query_column: this.dataSource.entityName,
              species: getSelectedSpecies(),
              query: params.term,
              page: params.page
            };
          }
        }
      }
    });

    const searchField = formBuilder.getElementById(`search-${this.dataSource.entityName}`);
    searchField.on('change', (data) => {
      session.store(TargidConstants.NEW_ENTRY_POINT, {
        view: (<any>this.desc).viewId,
        options: {
          search: {
            id: data.args['0'].id,
            type: this.dataSource.tableName
          }
        }
      });

      // create new graph and apply new view after window.reload (@see targid.checkForNewEntryPoint())
      this.options.targid.graphManager.newRemoteGraph();
    });
  }
}


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
