/**
 * Created by sam on 16.02.2017.
 */


import {IFormSelectDesc, convertRow2MultiMap} from 'tdp_core/src/form';
import AOncoPrint, {IDataFormatRow, ISample} from 'tdp_gene/src/views/AOncoPrint';
import {getSelectedSpecies} from 'tdp_gene/src/common';
import {ParameterFormIds, FORM_TISSUE_OR_CELLLINE_FILTER, FORM_DATA_SOURCE} from '../forms';
import {loadFirstName} from './utils';
import {toFilter} from 'tdp_gene/src/utils';
import {IDataSourceConfig} from '../config';
import {resolve} from 'phovea_core/src/idtype';
import {getTDPData, getTDPFilteredRows} from 'tdp_core/src/rest';

export default class OncoPrint extends AOncoPrint {


  protected getParameterFormDescs(): IFormSelectDesc[] {
    return [
      FORM_DATA_SOURCE,
      FORM_TISSUE_OR_CELLLINE_FILTER
    ];
  }


  private get dataSource() {
    return <IDataSourceConfig>this.getParameterData(ParameterFormIds.DATA_SOURCE);
  }

  protected async loadSampleList(): Promise<ISample[]> {
    const ds = this.dataSource;
    const param: any = {
      species: getSelectedSpecies()
    };
    toFilter(param, convertRow2MultiMap(this.getParameter('filter')));
    const rows = await getTDPFilteredRows(ds.db, `${ds.base}_onco_print_sample_list`, param, {});
    return rows.map((r) => ({name: r.id, id: r._id}));
  }

  protected getSampleIdType() {
    const ds = this.dataSource;
    return resolve(ds.idType);
  }

  protected loadRows(ensg: string): Promise<IDataFormatRow[]> {
    const ds = this.dataSource;
    const param: any = {
      ensg,
      species: getSelectedSpecies()
    };
    toFilter(param, convertRow2MultiMap(this.getParameter('filter')));
    return getTDPData(ds.db, `${ds.base}_onco_print/filter`, param);
  }

  protected loadFirstName(ensg: string): Promise<string> {
    return loadFirstName(ensg);
  }
}
