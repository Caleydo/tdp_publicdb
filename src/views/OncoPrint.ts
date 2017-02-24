/**
 * Created by sam on 16.02.2017.
 */


import {FormElementType, IFormSelectDesc} from 'ordino/src/FormBuilder';
import {IViewContext, ISelection} from 'ordino/src/View';
import AOncoPrint,{IDataFormatRow} from 'targid_common/src/views/AOncoPrint';
import {ParameterFormIds, dataSources, getSelectedSpecies, allTypes} from 'targid_common/src/Common';
import {getAPIJSON} from 'phovea_core/src/ajax';
import {loadFirstName} from './utils';

export class OncoPrint extends AOncoPrint {


  protected buildParameterConfig(): IFormSelectDesc[] {
    return [
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
        label: 'Tumor Type',
        id: ParameterFormIds.TUMOR_TYPE,
        dependsOn: [ParameterFormIds.DATA_SOURCE],
        options: {
          optionsFnc: (selection) => selection[0].data.tumorTypesWithAll,
          optionsData: []
        },
        useSession: true
      }
    ];
  }

   protected async loadSampleList(): Promise<string[]> {
    const ds = this.getParameter(ParameterFormIds.DATA_SOURCE);
    const tumortype = this.getParameter(ParameterFormIds.TUMOR_TYPE);
    const rows = await getAPIJSON(`/targid/db/${ds.db}/${ds.schema}_onco_print_sample_list${tumortype === allTypes ? '_all' : ''}`, {
      tumortype,
      species: getSelectedSpecies()
    });
    return rows.map((r) => r.id);
  }

  protected loadRows(ensg: string): Promise<IDataFormatRow[]> {
    const ds= this.getParameter(ParameterFormIds.DATA_SOURCE);
    const tumorType = this.getParameter(ParameterFormIds.TUMOR_TYPE);
    return getAPIJSON(`/targid/db/${ds.db}/${ds.schema}_onco_print${tumorType === allTypes ? '_all' : ''}`, {
      ensgs: '\'' + ensg + '\'',
      tumortype: tumorType,
      species: getSelectedSpecies()
    });
  }

  protected loadFirstName(ensg: string): Promise<string> {
    return loadFirstName(ensg);
  }
}



export function create(context:IViewContext, selection: ISelection, parent:Element, options?) {
  return new OncoPrint(context, selection, parent, options);
}
