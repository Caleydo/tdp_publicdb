/**
 * Created by Holger Stitz on 10.08.2016.
 */

import {IPluginDesc} from 'phovea_core/src/plugin';
import {AEntryPointList, IEntryPointOptions} from 'ordino/src/StartMenu';
import {defaultSpecies, getSelectedSpecies} from 'targid_common/src/Common';
import {IDataSourceConfig} from '../config';
import {ParameterFormIds} from '../forms';
import {INamedSet, ENamedSetType} from 'ordino/src/storage';
import {getAPIJSON, api2absURL} from 'phovea_core/src/ajax';
import * as session from 'phovea_core/src/session';
import {FormBuilder, FormElementType, IFormSelect2Element} from 'ordino/src/FormBuilder';
import {TargidConstants} from 'ordino/src/Targid';
import {generateDialog} from 'phovea_ui/src/dialogs';
import {saveNamedSet} from 'ordino/src/storage';
import {resolve} from 'phovea_core/src/idtype/manager';

export abstract class ACommonEntryPointList extends AEntryPointList {

  /**
   * Set the idType and the default data and build the list
   * @param parent
   * @param desc
   * @param options
   */
  constructor(protected parent: HTMLElement, public desc: IPluginDesc, protected dataSource: IDataSourceConfig, protected options: IEntryPointOptions) {
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

  protected searchOptions(): any {
    return {
      optionsData: [],
      placeholder: `Search ${this.dataSource.name}`,
      multiple: true,
      tags: true,
      tokenSeparators: [',', ' ', ';', '\t'],
      ajax: {
        url: api2absURL(`/targid/db/${this.dataSource.db}/${this.dataSource.base}_items/lookup`),
        data: (params: any) => {
          return {
            column: this.dataSource.entityName,
            species: getSelectedSpecies(),
            query: params.term,
            page: params.page
          };
        }
      }
    };
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
      options: this.searchOptions()
    });

    const $searchButton = $searchWrapper.append('div').append('button').classed('btn btn-primary', true).text('Go');
    const $saveSetButton = $searchWrapper.append('div').append('button').classed('btn btn-primary', true).text('Save');

    const searchField = formBuilder.getElementById(`search-${this.dataSource.entityName}`);
    $searchButton.on('click', () => {
      session.store(TargidConstants.NEW_ENTRY_POINT, {
        view: (<any>this.desc).viewId,
        options: {
          search: {
            ids: (<IFormSelect2Element>searchField).values.map((d) => d.id),
            type: this.dataSource.tableName
          }
        }
      });

      // create new graph and apply new view after window.reload (@see targid.checkForNewEntryPoint())
      this.options.targid.graphManager.newRemoteGraph();
    });

    $saveSetButton.on('click', () => {
      const dialog = generateDialog('Save Named Set', 'Save');

      const form = document.createElement('form');

      form.innerHTML = `
        <form id="namedset_form">
        <div class="form-group">
          <label for="namedset_name">Name</label>
          <input type="text" class="form-control" id="namedset_name" placeholder="Name" required="required">
        </div>
        <div class="form-group">
          <label for="namedset_description">Description</label>
          <textarea class="form-control" id="namedset_description" rows="5" placeholder="Description"></textarea>
        </div>
      </form>
      `;

      dialog.onSubmit(async () => {
        const name = (<HTMLInputElement>document.getElementById('namedset_name')).value;
        const description = (<HTMLInputElement>document.getElementById('namedset_description')).value;
        const idStrings = (<IFormSelect2Element>searchField).values.map((d) => d.id);

        const idType = resolve(this.dataSource.idType);
        const ids = await idType.map(idStrings);

        const response = await saveNamedSet(name, idType, ids, {key: ParameterFormIds.SPECIES, value: defaultSpecies}, description);
        super.addNamedSet(response);
        dialog.hide();
      });

      dialog.body.appendChild(form);
      dialog.show();
    });
  }
}
