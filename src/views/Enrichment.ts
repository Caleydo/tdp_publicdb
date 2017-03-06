/**
 * Created by Samuel Gratzl on 27.04.2016.
 */


import * as ajax from 'phovea_core/src/ajax';
import * as idtypes from 'phovea_core/src/idtype';
import {IViewContext, ISelection} from 'ordino/src/View';
import {ALineUpView, stringCol, numberCol2, useDefaultLayout} from 'ordino/src/LineUpView';
import {dataSources, allTypes, copyNumberCat, ParameterFormIds, getSelectedSpecies} from 'targid_common/src/Common';
import {FormBuilder, FormElementType, IFormSelectDesc} from 'ordino/src/FormBuilder';
import {showErrorModalDialog} from 'ordino/src/Dialogs';

export class Enrichment extends ALineUpView {

  private lineupPromise : Promise<any>;

  private paramForm:FormBuilder;
  private paramDesc:IFormSelectDesc[] = [
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
      label: 'Alteration Type',
      id: ParameterFormIds.ALTERATION_TYPE,
      options: {
        optionsData: copyNumberCat.map((ds) => {
          return {name: ds.name, value: ds.name, data: ds};
        })
      },
      useSession: true
    },
    {
      type: FormElementType.SELECT,
      label: 'Tumor Type',
      id: ParameterFormIds.TUMOR_TYPE,
      dependsOn: [ParameterFormIds.DATA_SOURCE],
      options: {
        optionsFnc: (selection) => selection[0].data.tumorTypesWithAll,
        optionsData: [],
      },
      useSession: true
    }
  ];

  constructor(context:IViewContext, private selection: ISelection, parent:Element, options?) {
    super(context, parent, options);
  }

  init() {
    this.build();
    this.update();
  }

  buildParameterUI($parent: d3.Selection<any>, onChange: (name: string, value: any)=>Promise<any>) {
    this.paramForm = new FormBuilder($parent);

    // map FormElement change function to provenance graph onChange function
    this.paramDesc.forEach((p) => {
      p.options.onChange = (selection, formElement) => onChange(formElement.id, selection.value);
    });

    this.paramForm.build(this.paramDesc);

    // add other fields
    super.buildParameterUI($parent.select('form'), onChange);
  }

  getParameter(name: string): any {
    return this.paramForm.getElementById(name).value.data;
  }

  setParameter(name: string, value: any) {
    this.paramForm.getElementById(name).value = value;
    return this.update();
  }

  changeSelection(selection: ISelection) {
    this.selection = selection;
    return this.update();
  }

  private update() {

    const id = this.selection.range.first;
    const idtype = this.selection.idtype;
    this.setBusy(true);

    const promise = Promise.all([this.lineupPromise, this.resolveId(idtype, id, 'Ensembl')])
      .then((args) => {
        const ensg = args[1];
        const url = `/targid/db/${this.getParameter(ParameterFormIds.DATA_SOURCE).db}/enrichment${this.getParameter(ParameterFormIds.TUMOR_TYPE) === allTypes ? '_all' : ''}`;
        const param = {
          ensg,
          schema: this.getParameter(ParameterFormIds.DATA_SOURCE).schema,
          entity_name: this.getParameter(ParameterFormIds.DATA_SOURCE).entityName,
          table_name: this.getParameter(ParameterFormIds.DATA_SOURCE).tableName,
          cn: this.getParameter(ParameterFormIds.ALTERATION_TYPE).value,
          tumortype: this.getParameter(ParameterFormIds.TUMOR_TYPE),
          species: getSelectedSpecies()
        };
        return ajax.getAPIJSON(url, param);
      });

    // on error
    promise.catch(showErrorModalDialog)
      .catch((error) => {
        console.error(error);
        this.setBusy(false);
      });

    // on success
    promise.then((rows) => {
      this.fillIDTypeMapCache(idtype, rows);

      // show or hide no data message
      this.$nodata.classed('hidden', rows.length > 0);

      //console.log(rows.length, rows);
      if(rows.length === 0) {
        console.warn('no data --> create a new (empty) LineUp');
        this.lineup.destroy();
        this.build();
        this.lineupPromise.then((d) => {
          this.setBusy(false);
        });

      } else {
        this.replaceLineUpData(rows);
        this.updateMapping('score', rows);
        this.setBusy(false);
      }
    });

    return promise;
  }

  private build() {
    //generate random data
    this.setBusy(true);
    const columns = [
      stringCol('symbol','symbol'),
      numberCol2('score', -3, 3),
    ];
    const lineup = this.buildLineUp([], columns, idtypes.resolve('Ensembl'),(d) => d._id);
    useDefaultLayout(lineup);
    lineup.update();

    this.initializedLineUp();

    this.lineupPromise = Promise.resolve(lineup);
  }
}

export function create(context:IViewContext, selection: ISelection, parent:Element, options?) {
  return new Enrichment(context, selection, parent, options);
}


