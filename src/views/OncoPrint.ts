/**
 * Created by sam on 16.02.2017.
 */


import {IFormSelectDesc} from 'ordino/src/FormBuilder';
import {IViewContext, ISelection} from 'ordino/src/View';
import AOncoPrint,{IDataFormatRow} from 'targid_common/src/views/AOncoPrint';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {ParameterFormIds, FORM_TISSUE_OR_CELLLINE_FILTER, FORM_DATA_SOURCE} from '../forms';
import {getAPIJSON} from 'phovea_core/src/ajax';
import {loadFirstName} from './utils';
import {convertRow2MultiMap} from 'ordino/src/form/internal/FormMap';
import {toFilter} from '../utils';

export class OncoPrint extends AOncoPrint {


  protected buildParameterConfig(): IFormSelectDesc[] {
    return [
      FORM_DATA_SOURCE,
      FORM_TISSUE_OR_CELLLINE_FILTER
    ];
  }

   protected async loadSampleList(): Promise<string[]> {
    const ds = this.getParameter(ParameterFormIds.DATA_SOURCE);
    const param: any = {
      species: getSelectedSpecies()
    };
    toFilter(param, convertRow2MultiMap(this.getParameter('filter')));
    const rows = await getAPIJSON(`/targid/db/${ds.db}/${ds.base}_onco_print_sample_list`, param);
    return rows.map((r) => r.id);
  }

  protected loadRows(ensg: string): Promise<IDataFormatRow[]> {
    const ds= this.getParameter(ParameterFormIds.DATA_SOURCE);
    const param: any = {
      ensg,
      species: getSelectedSpecies()
    };
    toFilter(param, convertRow2MultiMap(this.getParameter('filter')));
    return getAPIJSON(`/targid/db/${ds.db}/${ds.base}_onco_print`, param);
  }

  protected loadFirstName(ensg: string): Promise<string> {
    return loadFirstName(ensg);
  }
}



export function create(context:IViewContext, selection: ISelection, parent:Element, options?) {
  return new OncoPrint(context, selection, parent, options);
}
