/**
 * Created by sam on 16.02.2017.
 */


import {IFormSelectDesc} from 'tdp_core/src/form';
import AOncoPrint, {IDataFormatRow, ISample} from 'tdp_gene/src/views/AOncoPrint';
import {getSelectedSpecies} from 'tdp_gene/src/common';
import {ParameterFormIds, FORM_TISSUE_OR_CELLLINE_FILTER, FORM_DATA_SOURCE} from '../forms';
import {loadFirstName} from './utils';
import {IDataSourceConfig} from '../config';
import {resolve} from 'phovea_core/src/idtype';
import {getTDPData, getTDPFilteredRows, IParams, mergeParamAndFilters} from 'tdp_core/src/rest';
import {toFilter} from 'tdp_core/src/lineup';

export class OncoPrint extends AOncoPrint {


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
    const param: IParams = {
      species: getSelectedSpecies()
    };
    const rows = await getTDPFilteredRows(ds.db, `${ds.base}_onco_print_sample_list`, param, toFilter(this.getParameter('filter')));
    return rows.map((r) => ({name: r.id, id: r._id}));
  }

  protected getSampleIdType() {
    const ds = this.dataSource;
    return resolve(ds.idType);
  }

  protected loadRows(ensg: string): Promise<IDataFormatRow[]> {
    const ds = this.dataSource;
    const param: IParams = {
      ensg,
      species: getSelectedSpecies()
    };
    return getTDPData(ds.db, `${ds.base}_onco_print`, mergeParamAndFilters(param, toFilter(this.getParameter('filter'))));
  }

  protected loadFirstName(ensg: string): Promise<string> {
    return loadFirstName(ensg);
  }
}
